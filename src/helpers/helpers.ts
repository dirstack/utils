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
