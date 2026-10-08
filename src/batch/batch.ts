/**
 * Utility functions for processing items in batches.
 */

import { chunk } from "../array/array.js"
import { toError } from "../errors/errors.js"
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

/** Options for {@link processBatch} and {@link processBatchSettled}. */
export interface ProcessBatchOptions {
  /** The number of items in each batch. Must be at least 1. */
  batchSize: number
  /** The maximum number of items processed at once within a batch. Defaults to `batchSize`. */
  concurrency?: number
  /** Milliseconds to wait between batches. Defaults to 0. */
  delay?: number
  /** Called after each batch finishes. */
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

/** The outcome for one item of {@link processBatchSettled}. */
export type BatchResult<T, R> =
  | { status: "fulfilled"; item: T; value: R }
  | { status: "rejected"; item: T; error: Error }

/** Options for {@link processBatchSettled}. */
export interface ProcessBatchSettledOptions<T> extends ProcessBatchOptions {
  /** Called with each failure as it happens. */
  onError?: (error: Error, item: T) => void
}

/**
 * Processes items like {@link processBatch}, but keeps going when an item fails, the way
 * `Promise.allSettled` does. Each result says whether its item succeeded and carries the item,
 * so failures can be reported or retried.
 * @param items - The items to process.
 * @param processor - The async function that processes one item.
 * @param options - Batch size, concurrency, delay, progress and error callbacks.
 * @returns One result per item, in input order.
 * @example
 * const results = await processBatchSettled(tools, refreshTool, { batchSize: 10 })
 * const failed = results.filter(result => result.status === "rejected")
 */
export async function processBatchSettled<T, R>(
  items: readonly T[],
  processor: (item: T) => Promise<R>,
  options: ProcessBatchSettledOptions<T>,
): Promise<BatchResult<T, R>[]> {
  const { onError } = options

  async function settle(item: T): Promise<BatchResult<T, R>> {
    try {
      return { status: "fulfilled", item, value: await processor(item) }
    } catch (thrown) {
      const error = toError(thrown)
      onError?.(error, item)
      return { status: "rejected", item, error }
    }
  }

  return processBatch(items, settle, options)
}
