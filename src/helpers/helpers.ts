/**
 * General-purpose helpers that don't belong to a specific domain.
 */

/**
 * Returns a promise that resolves after the specified delay.
 * @param delay - The delay in milliseconds.
 */
export function sleep(delay: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, delay))
}

/**
 * Checks if a value is truthy. Works as a type guard in `filter` calls.
 * @param value - The value to check.
 * @returns A boolean indicating if the value is truthy.
 */
export function isTruthy<T>(value?: T | undefined | null | false): value is T {
  return !!value
}

/**
 * The successful result of {@link tryCatch}: data and no error.
 */
export interface Success<T> {
  data: T
  error: null
}

/**
 * The failed result of {@link tryCatch}: an error and no data.
 */
export interface Failure<E> {
  data: null
  error: E
}

/**
 * The result of {@link tryCatch}: either data or an error. Check `error` to narrow it.
 */
export type Result<T, E = Error> = Success<T> | Failure<E>

/**
 * Wraps a promise and returns a result object with the data or error.
 * @param promise - The promise to wrap.
 * @returns A result object with the data or error.
 */
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as E }
  }
}

/**
 * Rejects with an `Error` when `promise` does not settle within `ms` milliseconds.
 * The timer is cleared as soon as the promise settles, so it never keeps a process alive.
 * The original promise keeps running; this only stops waiting for it.
 * @param promise - The promise to wait for.
 * @param ms - How long to wait, in milliseconds.
 * @param message - The error message on timeout. Defaults to "Timed out after {ms}ms".
 * @returns A promise that settles like `promise`, or rejects on timeout.
 * @example
 * const response = await withTimeout(fetch(url), 5000, "Health check timed out")
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message = `Timed out after ${ms}ms`,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms)
  })

  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Options for {@link retry}.
 */
export interface RetryOptions {
  /** Maximum number of retries after the initial attempt (default: 3). */
  retries?: number
  /** Base delay between attempts in milliseconds (default: 0). */
  delay?: number
  /** Multiplier applied to the delay after each failed attempt (default: 2). */
  factor?: number
  /**
   * Decides whether an error is worth another attempt, such as a 5xx response but not a 4xx.
   * Returning false rethrows the error at once. Retries every error by default.
   */
  shouldRetry?: (error: unknown, attempt: number) => boolean
  /** Called before each retry with the error and the upcoming attempt number. */
  onRetry?: (error: unknown, attempt: number) => void
}

/**
 * Runs an async function, retrying it on failure with exponential backoff.
 * Rethrows the last error once all retries are exhausted, or as soon as `shouldRetry` returns false.
 * @param callback - The async function to run.
 * @param options - Retry configuration.
 * @returns The resolved value of `callback`.
 */
export async function retry<T>(callback: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { retries = 3, delay = 0, factor = 2, shouldRetry, onRetry } = options

  for (let attempt = 0; ; attempt++) {
    try {
      return await callback()
    } catch (error) {
      if (attempt >= retries) throw error
      if (shouldRetry && !shouldRetry(error, attempt + 1)) throw error
      onRetry?.(error, attempt + 1)
      if (delay > 0) await sleep(delay * factor ** attempt)
    }
  }
}
