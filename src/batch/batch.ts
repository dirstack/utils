import { chunk } from "../array/array"
import { sleep } from "../helpers/helpers"

/**
 * Progress reported after each batch finishes processing.
 */
export type ProcessBatchProgress = {
  /** The 1-based index of the batch that just finished. */
  batch: number
  /** The total number of batches. */
  totalBatches: number
  /** The number of items processed so far across all batches. */
  completed: number
  /** The total number of items. */
  total: number
}

type ProcessBatchOptions = {
  batchSize: number
  concurrency?: number
  delay?: number
  onProgress?: (progress: ProcessBatchProgress) => void
}

/**
 * Process items in batches with controlled concurrency and delays.
 * Useful for handling external API rate limits. Results are returned in the
 * same order as the input.
 */
export const processBatch = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: ProcessBatchOptions,
): Promise<R[]> => {
  const { batchSize, concurrency = batchSize, delay = 0, onProgress } = options

  if (items.length === 0) return []

  const results: R[] = []
  const batches = chunk(items, batchSize)

  for (const [i, batch] of batches.entries()) {
    // Process batch with controlled concurrency
    const batchResults = await processWithConcurrency(batch, processor, concurrency)
    results.push(...batchResults)

    onProgress?.({
      batch: i + 1,
      totalBatches: batches.length,
      completed: results.length,
      total: items.length,
    })

    // Add delay between batches (except for the last batch)
    if (delay > 0 && i < batches.length - 1) {
      await sleep(delay)
    }
  }

  return results
}

/**
 * Batch processing with error handling - continues processing even if some items fail
 */
export const processBatchWithErrorHandling = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: ProcessBatchOptions & {
    onError?: (error: Error, item: T) => void
  },
): Promise<Array<R | Error>> => {
  const { onError } = options

  const wrappedProcessor = async (item: T): Promise<R | Error> => {
    try {
      return await processor(item)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      onError?.(err, item)
      return err
    }
  }

  return processBatch(items, wrappedProcessor, options)
}

/**
 * Process items with a fixed pool of workers, capping in-flight work at
 * `concurrency`. Results are written back at the item's original index, so the
 * returned array always matches the input order.
 */
const processWithConcurrency = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> => {
  const results = new Array<R>(items.length)
  let next = 0

  const worker = async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await processor(items[index]!)
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, items.length))
  await Promise.all(Array.from({ length: workerCount }, worker))

  return results
}
