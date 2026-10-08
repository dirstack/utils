import { beforeEach, describe, expect, it, vi } from "vitest"
import { type BatchResult, processBatch, processBatchSettled } from "./batch"

/**
 * Reduces settled results to their values, with each failure as its error, for compact assertions.
 */
function outcomes<R>(results: BatchResult<unknown, R>[]) {
  return results.map(result => (result.status === "fulfilled" ? result.value : result.error))
}

/**
 * Wraps `work` in an async processor that records how many calls run at the same time.
 */
function trackConcurrency<R>(work: (item: number) => R) {
  const state = { active: 0, max: 0 }

  async function processor(item: number) {
    state.active++
    state.max = Math.max(state.max, state.active)
    await new Promise(resolve => setTimeout(resolve, 5))
    state.active--
    return work(item)
  }

  return { processor, state }
}

/**
 * Spies on `setTimeout` and counts the timers requested with exactly `ms` milliseconds.
 */
function spyOnTimers() {
  const spy = vi.spyOn(globalThis, "setTimeout")
  // Restoring the spy clears its calls, so keep a copy
  let calls: unknown[][] = []

  return {
    count: (ms: number) => calls.filter(call => call[1] === ms).length,
    restore: () => {
      calls = [...spy.mock.calls]
      spy.mockRestore()
    },
  }
}

describe("processBatch", () => {
  let processedItems: number[] = []
  let processingOrder: number[] = []

  beforeEach(() => {
    processedItems = []
    processingOrder = []
  })

  function createProcessor(delay = 0, shouldTrackOrder = false) {
    return async (item: number) => {
      if (shouldTrackOrder) {
        processingOrder.push(item)
      }
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      processedItems.push(item)
      return item * 2
    }
  }

  it("should process an empty array and return empty results", async () => {
    const items: number[] = []
    const processor = createProcessor()
    const results = await processBatch(items, processor, { batchSize: 2 })

    expect(results).toEqual([])
  })

  it("should reject a batch size below 1 instead of hanging", async () => {
    await expect(processBatch([1, 2], async item => item, { batchSize: 0 })).rejects.toThrow(
      RangeError,
    )
  })

  it("should process a single item", async () => {
    const items = [1]
    const processor = createProcessor()
    const results = await processBatch(items, processor, { batchSize: 2 })

    expect(results).toEqual([2])
    expect(processedItems).toEqual([1])
  })

  it("should process items in batches of specified size", async () => {
    const items = [1, 2, 3, 4, 5]
    const processor = createProcessor()
    const results = await processBatch(items, processor, { batchSize: 2 })

    expect(results).toEqual([2, 4, 6, 8, 10])
    expect(processedItems).toEqual([1, 2, 3, 4, 5])
  })

  it("should respect batch size when items length is not evenly divisible", async () => {
    const items = [1, 2, 3, 4, 5, 6, 7]
    const processor = createProcessor()
    const results = await processBatch(items, processor, { batchSize: 3 })

    expect(results).toEqual([2, 4, 6, 8, 10, 12, 14])
    expect(processedItems).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it("should process with controlled concurrency", async () => {
    const { processor, state } = trackConcurrency(item => item * 2)
    const results = await processBatch([1, 2, 3, 4, 5, 6], processor, {
      batchSize: 6,
      concurrency: 2,
    })

    expect(results).toEqual([2, 4, 6, 8, 10, 12])
    expect(state.max).toBe(2)
  })

  it("should process all items concurrently when concurrency >= items length", async () => {
    const { processor, state } = trackConcurrency(item => item * 2)
    const results = await processBatch([1, 2, 3, 4], processor, { batchSize: 4, concurrency: 5 })

    expect(results).toEqual([2, 4, 6, 8])
    expect(state.max).toBe(4)
  })

  it("should add delays between batches", async () => {
    const timers = spyOnTimers()
    await processBatch([1, 2, 3, 4], createProcessor(5), { batchSize: 2, delay: 50 })
    timers.restore()

    // One delay between the two batches
    expect(timers.count(50)).toBe(1)
  })

  it("should not add delay after the last batch", async () => {
    const timers = spyOnTimers()
    await processBatch([1, 2], createProcessor(5), { batchSize: 2, delay: 100 })
    timers.restore()

    expect(timers.count(100)).toBe(0)
  })

  it("should use default concurrency equal to batch size", async () => {
    const { processor, state } = trackConcurrency(item => item)
    await processBatch([1, 2, 3, 4, 5, 6], processor, { batchSize: 4 })

    expect(state.max).toBe(4)
  })

  it("should handle large batch sizes", async () => {
    const items = Array.from({ length: 100 }, (_, i) => i + 1)
    const processor = createProcessor()
    const results = await processBatch(items, processor, { batchSize: 25 })

    expect(results).toHaveLength(100)
    expect(results[0]).toBe(2) // 1 * 2
    expect(results[99]).toBe(200) // 100 * 2
  })

  it("should maintain order of results within batches", async () => {
    const items = [3, 1, 4, 2]
    const processor = createProcessor()
    const results = await processBatch(items, processor, { batchSize: 4 })

    expect(results).toEqual([6, 2, 8, 4]) // Maintains input order
  })

  it("should preserve order and not drop results with uneven completion times", async () => {
    // Earlier items finish later than later items. A naive completion-ordered
    // pool would reorder and drop results here.
    const items = [1, 2, 3, 4, 5, 6]
    async function processor(item: number) {
      await new Promise(resolve => setTimeout(resolve, (7 - item) * 10))
      return item * 2
    }
    const results = await processBatch(items, processor, { batchSize: 6, concurrency: 2 })

    expect(results).toEqual([2, 4, 6, 8, 10, 12])
  })

  it("should report progress after each batch", async () => {
    const items = [1, 2, 3, 4, 5]
    const processor = createProcessor()
    const progress: { batch: number; completed: number }[] = []

    await processBatch(items, processor, {
      batchSize: 2,
      onProgress: ({ batch, totalBatches, completed, total }) => {
        expect(totalBatches).toBe(3)
        expect(total).toBe(5)
        progress.push({ batch, completed })
      },
    })

    expect(progress).toEqual([
      { batch: 1, completed: 2 },
      { batch: 2, completed: 4 },
      { batch: 3, completed: 5 },
    ])
  })
})

describe("processBatchSettled", () => {
  let processedItems: number[] = []
  let errors: { error: Error; item: number }[] = []

  beforeEach(() => {
    processedItems = []
    errors = []
  })

  function createProcessorWithErrors(errorItems: number[] = []) {
    return async (item: number) => {
      if (errorItems.includes(item)) {
        throw new Error(`Error processing item ${item}`)
      }
      processedItems.push(item)
      return item * 2
    }
  }

  function errorHandler(error: Error, item: number) {
    errors.push({ error, item })
  }

  it("should process items without errors normally", async () => {
    const items = [1, 2, 3, 4]
    const processor = createProcessorWithErrors([])
    const settled = await processBatchSettled(items, processor, {
      batchSize: 2,
      onError: errorHandler,
    })
    const results = outcomes(settled)

    expect(results).toEqual([2, 4, 6, 8])
    expect(errors).toHaveLength(0)
    expect(processedItems).toEqual([1, 2, 3, 4])
  })

  it("should handle errors and continue processing other items", async () => {
    const items = [1, 2, 3, 4]
    const processor = createProcessorWithErrors([2, 4])
    const settled = await processBatchSettled(items, processor, {
      batchSize: 2,
      onError: errorHandler,
    })
    const results = outcomes(settled)

    // Results should contain successful results and Error objects
    expect(results).toHaveLength(4)
    expect(results[0]).toBe(2) // Item 1 successful
    expect(results[1]).toBeInstanceOf(Error) // Item 2 failed
    expect(results[2]).toBe(6) // Item 3 successful
    expect(results[3]).toBeInstanceOf(Error) // Item 4 failed

    expect(errors).toHaveLength(2)
    expect(errors[0]?.item).toBe(2)
    expect(errors[1]?.item).toBe(4)
    expect(processedItems).toEqual([1, 3])
  })

  it("should handle all items failing", async () => {
    const items = [1, 2, 3]
    const processor = createProcessorWithErrors([1, 2, 3])
    const settled = await processBatchSettled(items, processor, {
      batchSize: 2,
      onError: errorHandler,
    })
    const results = outcomes(settled)

    expect(results).toHaveLength(3)
    results.forEach(result => {
      expect(result).toBeInstanceOf(Error)
    })

    expect(errors).toHaveLength(3)
    expect(processedItems).toHaveLength(0)
  })

  it("should work without error handler", async () => {
    const items = [1, 2, 3]
    const processor = createProcessorWithErrors([2])
    const settled = await processBatchSettled(items, processor, { batchSize: 2 })
    const results = outcomes(settled)

    expect(results).toHaveLength(3)
    expect(results[0]).toBe(2)
    expect(results[1]).toBeInstanceOf(Error)
    expect(results[2]).toBe(6)
  })

  it("should handle non-Error exceptions", async () => {
    async function processor(item: number) {
      if (item === 2) {
        throw "String error"
      }
      return item * 2
    }

    const settled = await processBatchSettled([1, 2, 3], processor, {
      batchSize: 3,
      onError: errorHandler,
    })
    const results = outcomes(settled)

    expect(results).toHaveLength(3)
    expect(results[1]).toBeInstanceOf(Error)
    expect((results[1] as Error).message).toBe("String error")
  })

  it("should respect concurrency and timing options", async () => {
    const { processor, state } = trackConcurrency(item => {
      if (item === 3) throw new Error("Test error")
      return item * 2
    })

    const settled = await processBatchSettled([1, 2, 3, 4, 5, 6], processor, {
      batchSize: 6,
      concurrency: 2,
      onError: errorHandler,
    })
    const results = outcomes(settled)

    expect(results).toHaveLength(6)
    expect(errors).toHaveLength(1)
    expect(errors[0]?.item).toBe(3)
    expect(state.max).toBe(2)
  })

  it("should handle empty array", async () => {
    const processor = createProcessorWithErrors([])
    const settled = await processBatchSettled([], processor, {
      batchSize: 2,
      onError: errorHandler,
    })
    const results = outcomes(settled)

    expect(results).toEqual([])
    expect(errors).toHaveLength(0)
  })

  it("reports each item with its status", async () => {
    const settled = await processBatchSettled([1, 2], createProcessorWithErrors([2]), {
      batchSize: 2,
    })

    expect(settled[0]).toEqual({ status: "fulfilled", item: 1, value: 2 })
    expect(settled[1]).toMatchObject({ status: "rejected", item: 2 })
    expect(settled[1]?.status === "rejected" && settled[1].error.message).toBe(
      "Error processing item 2",
    )
  })

  it("keeps a thrown non-Error value as the error's cause", async () => {
    const settled = await processBatchSettled(
      [1],
      async () => {
        throw { code: "E_RATE_LIMIT" }
      },
      { batchSize: 1 },
    )

    expect(settled[0]?.status === "rejected" && settled[0].error.cause).toEqual({
      code: "E_RATE_LIMIT",
    })
  })
})

interface ApiRequest {
  id: number
  data: string
}

describe("integration tests", () => {
  it("should handle complex real-world scenario", async () => {
    // Simulate processing API requests with rate limiting
    const apiRequests = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      data: `request-${i + 1}`,
    }))

    const failingIds = [5, 12, 18]
    let requestCount = 0

    async function mockApiCall(request: ApiRequest) {
      requestCount++
      await new Promise(resolve => setTimeout(resolve, 10)) // Simulate API delay

      if (failingIds.includes(request.id)) {
        throw new Error(`API error for request ${request.id}`)
      }

      return { id: request.id, result: `processed-${request.data}` }
    }

    const errors: { error: Error; item: ApiRequest }[] = []
    function errorHandler(error: Error, item: ApiRequest) {
      errors.push({ error, item })
    }

    const timers = spyOnTimers()
    const settled = await processBatchSettled(apiRequests, mockApiCall, {
      batchSize: 5,
      concurrency: 2,
      delay: 20, // Rate limiting delay
      onError: errorHandler,
    })
    const results = outcomes(settled)
    timers.restore()

    // Verify results
    expect(results).toHaveLength(20)
    expect(requestCount).toBe(20)
    expect(errors).toHaveLength(3)

    // Check successful results
    const successfulResults = results.filter(r => !(r instanceof Error))
    expect(successfulResults).toHaveLength(17)

    // Check failed requests
    expect(errors.map(e => e.item.id)).toEqual([5, 12, 18])

    // A rate-limiting delay between each of the 4 batches
    expect(timers.count(20)).toBe(3)
  })
})
