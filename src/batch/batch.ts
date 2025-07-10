import { sleep, splitArrayIntoChunks } from "../helpers/helpers"

type ProcessBatchOptions = {
  batchSize: number
  concurrency?: number
  delay?: number
}
/**
 * Process items in batches with controlled concurrency and delays
 * Useful for handling external API rate limits
 */
export const processBatch = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: ProcessBatchOptions,
): Promise<R[]> => {
  const { batchSize, concurrency = batchSize, delay = 0 } = options

  if (items.length === 0) return []

  const results: R[] = []
  const batches = splitArrayIntoChunks(items, batchSize)

  for (const [i, batch] of batches.entries()) {
    console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} items)`)

    // Process batch with controlled concurrency
    const batchResults = await processWithConcurrency(batch, processor, concurrency)
    results.push(...batchResults)

    // Add delay between batches (except for the last batch)
    if (delay > 0 && i < batches.length - 1) {
      console.log(`Waiting ${delay}ms before next batch...`)
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
 * Process items with controlled concurrency using a semaphore-like approach
 */
const processWithConcurrency = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> => {
  if (concurrency >= items.length) {
    // If concurrency is higher than items count, just process all at once
    return Promise.all(items.map(processor))
  }

  const results: R[] = []
  const executing: Promise<void>[] = []

  for (const item of items) {
    const promise = processor(item).then(result => {
      results.push(result)
    })

    executing.push(promise)

    // If we've reached the concurrency limit, wait for one to finish
    if (executing.length >= concurrency) {
      await Promise.race(executing)
      // Remove completed promises
      executing.splice(0, executing.length - executing.filter(p => p !== promise).length)
    }
  }

  // Wait for all remaining promises to complete
  await Promise.all(executing)

  return results
}
