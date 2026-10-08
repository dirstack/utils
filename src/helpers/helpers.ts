/**
 * General-purpose helpers that don't belong to a specific domain.
 */

/**
 * Returns a promise that resolves after the specified delay.
 * @param delay - The delay in milliseconds.
 */
export function sleep(delay: number) {
  return new Promise(resolve => setTimeout(resolve, delay))
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
 * A type representing a successful result with data and no error.
 */
interface Success<T> {
  data: T
  error: null
}

/**
 * A type representing a failed result with no data and an error.
 */
interface Failure<E> {
  data: null
  error: E
}

/**
 * A type representing a result with either data or an error.
 */
type Result<T, E = Error> = Success<T> | Failure<E>

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
 * Returns a debounced version of `callback` that delays invoking it until `delay`
 * milliseconds have passed since the last call. Call `.cancel()` to drop a
 * pending invocation.
 * @param callback - The function to debounce.
 * @param delay - The delay in milliseconds.
 * @returns The debounced function with a `cancel` method.
 */
export function debounce<Args extends unknown[]>(callback: (...args: Args) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout> | undefined

  function debounced(...args: Args) {
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => callback(...args), delay)
  }

  debounced.cancel = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }

  return debounced
}

/**
 * Returns a throttled version of `callback` that invokes it at most once per
 * `interval` milliseconds. The first call fires immediately (leading edge) and
 * the last call within the interval fires at the end (trailing edge).
 * @param callback - The function to throttle.
 * @param interval - The minimum interval between calls, in milliseconds.
 * @returns The throttled function.
 */
export function throttle<Args extends unknown[]>(
  callback: (...args: Args) => void,
  interval: number,
) {
  let lastCallTime = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let lastArgs: Args | undefined

  return (...args: Args) => {
    const now = Date.now()
    const remaining = interval - (now - lastCallTime)

    if (remaining <= 0) {
      lastCallTime = now
      callback(...args)
    } else {
      // Remember the most recent args so the trailing call uses them.
      lastArgs = args
      if (timer === undefined) {
        timer = setTimeout(() => {
          lastCallTime = Date.now()
          timer = undefined
          if (lastArgs) callback(...lastArgs)
        }, remaining)
      }
    }
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
  /** Called before each retry with the error and the upcoming attempt number. */
  onRetry?: (error: unknown, attempt: number) => void
}

/**
 * Runs an async function, retrying it on failure with exponential backoff.
 * Rethrows the last error once all retries are exhausted.
 * @param callback - The async function to run.
 * @param options - Retry configuration.
 * @returns The resolved value of `callback`.
 */
export async function retry<T>(callback: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { retries = 3, delay = 0, factor = 2, onRetry } = options

  for (let attempt = 0; ; attempt++) {
    try {
      return await callback()
    } catch (error) {
      if (attempt >= retries) throw error
      onRetry?.(error, attempt + 1)
      if (delay > 0) await sleep(delay * factor ** attempt)
    }
  }
}
