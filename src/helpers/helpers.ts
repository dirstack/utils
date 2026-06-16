/**
 * General-purpose helpers that don't belong to a specific domain.
 */

/**
 * Delays the execution of the function by the specified amount of time.
 * @param delay - The amount of time to delay the execution of the function, in milliseconds.
 */
export const sleep = async (delay: number) => {
  return new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * Check if a value is truthy
 * @param value - The value to check
 * @returns A boolean indicating if the value is truthy
 */
export const isTruthy = <T>(value?: T | undefined | null | false): value is T => {
  return !!value
}

/**
 * A type representing a successful result with data and no error.
 */
type Success<T> = {
  data: T
  error: null
}

/**
 * A type representing a failed result with no data and an error.
 */
type Failure<E> = {
  data: null
  error: E
}

/**
 * A type representing a result with either data or an error.
 */
type Result<T, E = Error> = Success<T> | Failure<E>

/**
 * Wraps a promise and returns a result object with the data or error
 * @param promise - The promise to wrap
 * @returns A result object with the data or error
 */
export const tryCatch = async <T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> => {
  try {
    const data = await promise
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as E }
  }
}

/**
 * Returns a debounced version of `fn` that delays invoking it until `delay`
 * milliseconds have passed since the last call. Call `.cancel()` to drop a
 * pending invocation.
 * @param fn - The function to debounce.
 * @param delay - The delay in milliseconds.
 * @returns The debounced function with a `cancel` method.
 */
export const debounce = <Args extends unknown[]>(fn: (...args: Args) => void, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | undefined

  const debounced = (...args: Args) => {
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }

  debounced.cancel = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }

  return debounced
}

/**
 * Returns a throttled version of `fn` that invokes it at most once per
 * `interval` milliseconds. The first call fires immediately (leading edge) and
 * the last call within the interval fires at the end (trailing edge).
 * @param fn - The function to throttle.
 * @param interval - The minimum interval between calls, in milliseconds.
 * @returns The throttled function.
 */
export const throttle = <Args extends unknown[]>(fn: (...args: Args) => void, interval: number) => {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let lastArgs: Args | undefined

  return (...args: Args) => {
    const now = Date.now()
    const remaining = interval - (now - last)

    if (remaining <= 0) {
      last = now
      fn(...args)
    } else {
      // Remember the most recent args so the trailing call uses them.
      lastArgs = args
      if (timer === undefined) {
        timer = setTimeout(() => {
          last = Date.now()
          timer = undefined
          if (lastArgs) fn(...lastArgs)
        }, remaining)
      }
    }
  }
}

/**
 * Options for {@link retry}.
 */
export type RetryOptions = {
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
 * @param fn - The async function to run.
 * @param options - Retry configuration.
 * @returns The resolved value of `fn`.
 */
export const retry = async <T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
  const { retries = 3, delay = 0, factor = 2, onRetry } = options

  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt >= retries) throw error
      onRetry?.(error, attempt + 1)
      if (delay > 0) await sleep(delay * factor ** attempt)
    }
  }
}
