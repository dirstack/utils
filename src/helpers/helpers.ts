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
  /**
   * Maximum number of retries after the initial attempt (default: 3).
   * Pass `Infinity` to let `timeout`, `deadline` or `signal` alone end the loop.
   */
  retries?: number
  /** Base delay between attempts in milliseconds (default: 0). */
  delay?: number
  /** Multiplier applied to the delay after each failed attempt (default: 2). */
  factor?: number
  /** Upper bound for a single wait in milliseconds, applied after `factor` (default: no cap). */
  maxDelay?: number
  /**
   * Time budget in milliseconds, counted from the call to `retry`.
   * A wait that would end past the budget is never started: the last error is rethrown instead.
   * An attempt already running is not interrupted, so wrap it in {@link withTimeout} if it can hang.
   */
  timeout?: number
  /**
   * Absolute time budget as an epoch timestamp in milliseconds, such as `Date.now() + 15_000`.
   * Behaves like `timeout`, and lets several calls share one budget.
   * When both are set, the earlier of the two applies.
   */
  deadline?: number
  /**
   * Stops retrying when aborted, including during a wait, and rejects with `signal.reason`.
   * An attempt already running is not interrupted.
   */
  signal?: AbortSignal
  /**
   * Decides whether an error is worth another attempt, such as a 5xx response but not a 4xx.
   * Returning false rethrows the error at once. Retries every error by default.
   */
  shouldRetry?: (error: unknown, attempt: number) => boolean
  /** Called before each retry with the error and the upcoming attempt number. */
  onRetry?: (error: unknown, attempt: number) => void
}

/**
 * Waits `delay` milliseconds, or rejects with the abort reason as soon as `signal` aborts.
 */
function abortableSleep(delay: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort)
      resolve()
    }, delay)

    function onAbort() {
      clearTimeout(timer)
      reject(signal.reason)
    }

    signal.addEventListener("abort", onAbort, { once: true })
  })
}

/**
 * Runs an async function, retrying it on failure with exponential backoff.
 * Rethrows the last error once all retries are exhausted, as soon as `shouldRetry` returns false,
 * or when the next wait would end past `timeout` or `deadline`.
 * Rejects with `signal.reason` when `signal` aborts.
 * @param callback - The async function to run.
 * @param options - Retry configuration.
 * @returns The resolved value of `callback`.
 * @example
 * // Retry for up to 15 seconds, waiting 100ms, 200ms, 400ms, 800ms, then 1s between attempts.
 * await retry(connect, { retries: Infinity, delay: 100, maxDelay: 1000, timeout: 15_000 })
 */
export async function retry<T>(callback: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    retries = 3,
    delay = 0,
    factor = 2,
    maxDelay = Infinity,
    timeout,
    deadline,
    signal,
    shouldRetry,
    onRetry,
  } = options

  const budgetEndsAt = Math.min(
    deadline ?? Infinity,
    timeout === undefined ? Infinity : Date.now() + timeout,
  )

  for (let attempt = 0; ; attempt++) {
    signal?.throwIfAborted()

    try {
      return await callback()
    } catch (error) {
      signal?.throwIfAborted()
      if (attempt >= retries) throw error
      if (shouldRetry && !shouldRetry(error, attempt + 1)) throw error

      const wait = Math.min(delay * factor ** attempt, maxDelay)
      if (Date.now() + wait > budgetEndsAt) throw error

      onRetry?.(error, attempt + 1)
      if (wait > 0) await (signal ? abortableSleep(wait, signal) : sleep(wait))
    }
  }
}
