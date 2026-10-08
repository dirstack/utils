/**
 * Utility functions for processing items in batches.
 */

import { chunk } from "../array/array.js"
import { sleep } from "../helpers/helpers.js"

/**
 * Progress reported after each batch finishes processing.
 */
export interface ProcessBatchProgress {
  /** The 1-based index of the batch that just finished. */
  batch: number
  /** The total number of batches. */
  totalBatches: number
  /** The number of items processed so far across all batches. */
  completed: number
  /** The total number of items. */
  total: number
}

interface ProcessBatchOptions {
  batchSize: number
  concurrency?: number
  delay?: number
  onProgress?: (progress: ProcessBatchProgress) => void
}

/**
 * Process items with a fixed pool of workers, capping in-flight work at
 * `concurrency`. Results are written back at the item's original index, so the
 * returned array always matches the input order.
 */
async function processWithConcurrency<T, R>(
  items: readonly T[],
  processor: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0

  async function worker() {
    while (next < items.length) {
      const index = next++
      results[index] = await processor(items[index]!)
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, items.length))
  await Promise.all(Array.from({ length: workerCount }, worker))

  return results
}

/**
 * Process items in batches with controlled concurrency and delays.
 * Useful for handling external API rate limits. Results are returned in the
 * same order as the input.
 * @throws {RangeError} When `batchSize` is below 1 and there are items to process.
 */
export async function processBatch<T, R>(
  items: readonly T[],
  processor: (item: T) => Promise<R>,
  options: ProcessBatchOptions,
): Promise<R[]> {
  const { batchSize, concurrency = batchSize, delay = 0, onProgress } = options

  if (items.length === 0) return []

  const results: R[] = []
  const batches = chunk(items, batchSize)

  for (const [index, batch] of batches.entries()) {
    const batchResults = await processWithConcurrency(batch, processor, concurrency)
    results.push(...batchResults)

    onProgress?.({
      batch: index + 1,
      totalBatches: batches.length,
      completed: results.length,
      total: items.length,
    })

    if (delay > 0 && index < batches.length - 1) {
      await sleep(delay)
    }
  }

  return results
}

/**
 * Processes items like {@link processBatch}, but keeps going when an item fails.
 * A failed item's result is its `Error`, and `onError` is called with it.
 */
export async function processBatchWithErrorHandling<T, R>(
  items: readonly T[],
  processor: (item: T) => Promise<R>,
  options: ProcessBatchOptions & {
    onError?: (error: Error, item: T) => void
  },
): Promise<(R | Error)[]> {
  const { onError } = options

  async function wrappedProcessor(item: T): Promise<R | Error> {
    try {
      return await processor(item)
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error))
      onError?.(normalizedError, item)
      return normalizedError
    }
  }

  return processBatch(items, wrappedProcessor, options)
}
