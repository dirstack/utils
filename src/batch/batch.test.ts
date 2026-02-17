import { beforeEach, describe, expect, it } from "bun:test"
import { processBatch, processBatchWithErrorHandling } from "./batch"

describe("processBatch", () => {
  let processedItems: number[] = []
  let processingOrder: number[] = []

  beforeEach(() => {
    processedItems = []
    processingOrder = []
  })

  const createProcessor =
    (delay = 0, shouldTrackOrder = false) =>
    async (item: number) => {
      if (shouldTrackOrder) {
        processingOrder.push(item)
      }
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      processedItems.push(item)
      return item * 2
    }

  const createSlowProcessor = (delay = 50) => createProcessor(delay, true)

  it("should process an empty array and return empty results", async () => {
    const items: number[] = []
    const processor = createProcessor()
    const results = await processBatch(items, processor, { batchSize: 2 })

    expect(results).toEqual([])
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
    const items = [1, 2, 3, 4, 5, 6]
    const processor = createSlowProcessor(30)

    const startTime = Date.now()
    const results = await processBatch(items, processor, {
      batchSize: 6,
      concurrency: 2,
    })
    const endTime = Date.now()

    expect(results).toEqual([2, 4, 6, 8, 10, 12])

    // With concurrency of 2, 6 items should take roughly 3 * 30ms = 90ms
    // (3 sequential pairs of concurrent operations)
    const duration = endTime - startTime
    expect(duration).toBeGreaterThan(80) // Allow some tolerance
    expect(duration).toBeLessThan(150)
  })

  it("should process all items concurrently when concurrency >= items length", async () => {
    const items = [1, 2, 3, 4]
    const processor = createSlowProcessor(50)

    const startTime = Date.now()
    const results = await processBatch(items, processor, {
      batchSize: 4,
      concurrency: 5,
    })
    const endTime = Date.now()

    expect(results).toEqual([2, 4, 6, 8])

    // All items should process concurrently, so should take ~50ms total
    const duration = endTime - startTime
    expect(duration).toBeGreaterThan(40)
    expect(duration).toBeLessThan(80)
  })

  it("should add delays between batches", async () => {
    const items = [1, 2, 3, 4]
    const processor = createProcessor(5)

    const startTime = Date.now()
    await processBatch(items, processor, {
      batchSize: 2,
      delay: 50,
    })
    const endTime = Date.now()

    // Should have one delay of 50ms between the two batches
    const duration = endTime - startTime
    expect(duration).toBeGreaterThan(40) // Allow for timing variations
    expect(duration).toBeLessThan(200) // More generous for different system loads
  })

  it("should not add delay after the last batch", async () => {
    const items = [1, 2]
    const processor = createProcessor(5)

    const startTime = Date.now()
    await processBatch(items, processor, {
      batchSize: 2,
      delay: 100,
    })
    const endTime = Date.now()

    // Should not have any delays since there's only one batch
    const duration = endTime - startTime
    expect(duration).toBeLessThan(50)
  })

  it("should use default concurrency equal to batch size", async () => {
    const items = [1, 2, 3, 4]
    const processor = createSlowProcessor(30)

    const startTime = Date.now()
    await processBatch(items, processor, { batchSize: 4 })
    const endTime = Date.now()

    // All items in batch should process concurrently
    const duration = endTime - startTime
    expect(duration).toBeGreaterThan(25)
    expect(duration).toBeLessThan(60)
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
})

describe("processBatchWithErrorHandling", () => {
  let processedItems: number[] = []
  let errors: Array<{ error: Error; item: number }> = []

  beforeEach(() => {
    processedItems = []
    errors = []
  })

  const createProcessorWithErrors =
    (errorItems: number[] = []) =>
    async (item: number) => {
      if (errorItems.includes(item)) {
        throw new Error(`Error processing item ${item}`)
      }
      processedItems.push(item)
      return item * 2
    }

  const errorHandler = (error: Error, item: number) => {
    errors.push({ error, item })
  }

  it("should process items without errors normally", async () => {
    const items = [1, 2, 3, 4]
    const processor = createProcessorWithErrors([])
    const results = await processBatchWithErrorHandling(items, processor, {
      batchSize: 2,
      onError: errorHandler,
    })

    expect(results).toEqual([2, 4, 6, 8])
    expect(errors).toHaveLength(0)
    expect(processedItems).toEqual([1, 2, 3, 4])
  })

  it("should handle errors and continue processing other items", async () => {
    const items = [1, 2, 3, 4]
    const processor = createProcessorWithErrors([2, 4])
    const results = await processBatchWithErrorHandling(items, processor, {
      batchSize: 2,
      onError: errorHandler,
    })

    // Results should contain successful results and Error objects
    expect(results).toHaveLength(4)
    expect(results[0]).toBe(2) // Item 1 successful
    expect(results[1]).toBeInstanceOf(Error) // Item 2 failed
    expect(results[2]).toBe(6) // Item 3 successful
    expect(results[3]).toBeInstanceOf(Error) // Item 4 failed

    expect(errors).toHaveLength(2)
    expect(errors[0].item).toBe(2)
    expect(errors[1].item).toBe(4)
    expect(processedItems).toEqual([1, 3])
  })

  it("should handle all items failing", async () => {
    const items = [1, 2, 3]
    const processor = createProcessorWithErrors([1, 2, 3])
    const results = await processBatchWithErrorHandling(items, processor, {
      batchSize: 2,
      onError: errorHandler,
    })

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
    const results = await processBatchWithErrorHandling(items, processor, { batchSize: 2 })

    expect(results).toHaveLength(3)
    expect(results[0]).toBe(2)
    expect(results[1]).toBeInstanceOf(Error)
    expect(results[2]).toBe(6)
  })

  it("should handle non-Error exceptions", async () => {
    const processor = async (item: number) => {
      if (item === 2) {
        throw "String error"
      }
      return item * 2
    }

    const results = await processBatchWithErrorHandling([1, 2, 3], processor, {
      batchSize: 3,
      onError: errorHandler,
    })

    expect(results).toHaveLength(3)
    expect(results[1]).toBeInstanceOf(Error)
    expect((results[1] as Error).message).toBe("String error")
  })

  it("should respect concurrency and timing options", async () => {
    const items = [1, 2, 3, 4, 5, 6]
    const processor = async (item: number) => {
      await new Promise(resolve => setTimeout(resolve, 20))
      if (item === 3) throw new Error("Test error")
      return item * 2
    }

    const startTime = Date.now()
    const results = await processBatchWithErrorHandling(items, processor, {
      batchSize: 6,
      concurrency: 2,
      onError: errorHandler,
    })
    const endTime = Date.now()

    expect(results).toHaveLength(6)
    expect(errors).toHaveLength(1)
    expect(errors[0].item).toBe(3)

    // Should take roughly 3 * 20ms for 3 sequential pairs
    const duration = endTime - startTime
    expect(duration).toBeGreaterThan(50)
    expect(duration).toBeLessThan(100)
  })

  it("should handle empty array", async () => {
    const processor = createProcessorWithErrors([])
    const results = await processBatchWithErrorHandling([], processor, {
      batchSize: 2,
      onError: errorHandler,
    })

    expect(results).toEqual([])
    expect(errors).toHaveLength(0)
  })
})

describe("integration tests", () => {
  it("should handle complex real-world scenario", async () => {
    // Simulate processing API requests with rate limiting
    const apiRequests = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      data: `request-${i + 1}`,
    }))

    const failingIds = [5, 12, 18]
    let requestCount = 0

    const mockApiCall = async (request: { id: number; data: string }) => {
      requestCount++
      await new Promise(resolve => setTimeout(resolve, 10)) // Simulate API delay

      if (failingIds.includes(request.id)) {
        throw new Error(`API error for request ${request.id}`)
      }

      return { id: request.id, result: `processed-${request.data}` }
    }

    const errors: Array<{ error: Error; item: any }> = []
    const errorHandler = (error: Error, item: any) => {
      errors.push({ error, item })
    }

    const startTime = Date.now()
    const results = await processBatchWithErrorHandling(apiRequests, mockApiCall, {
      batchSize: 5,
      concurrency: 2,
      delay: 20, // Rate limiting delay
      onError: errorHandler,
    })
    const endTime = Date.now()

    // Verify results
    expect(results).toHaveLength(20)
    expect(requestCount).toBe(20)
    expect(errors).toHaveLength(3)

    // Check successful results
    const successfulResults = results.filter(r => !(r instanceof Error))
    expect(successfulResults).toHaveLength(17)

    // Check failed requests
    expect(errors.map(e => e.item.id)).toEqual([5, 12, 18])

    // Verify timing (4 batches * 20ms delay between + processing time)
    const duration = endTime - startTime
    expect(duration).toBeGreaterThan(60) // 3 delays + processing time
    expect(duration).toBeLessThan(400) // Very generous for CI and different system loads
  })
})
