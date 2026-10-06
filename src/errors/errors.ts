/**
 * Utility functions for working with errors.
 */

/**
 * An error object with a message property.
 */
export interface ErrorWithMessage {
  message: string
}

/**
 * Type guard function that checks if an object is an ErrorWithMessage.
 * @param error - The object to check.
 * @returns True if the object is an ErrorWithMessage, false otherwise.
 */
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  )
}

/**
 * Converts an unknown value to an ErrorWithMessage object.
 * If the value is already an ErrorWithMessage, it is returned as-is.
 * Otherwise, a new Error object is created with the value stringified as its message.
 * @param maybeError - The value to convert.
 * @returns An ErrorWithMessage object.
 */
export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // JSON.stringify throws on circular references and BigInt values.
    return new Error(String(maybeError))
  }
}

/**
 * Gets the error message from an unknown value.
 * If the value is an ErrorWithMessage, its message property is returned.
 * Otherwise, the value is stringified and returned as the error message.
 * @param error - The value to get the error message from.
 * @returns The error message as a string.
 */
export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message
}

/**
 * Converts a thrown value to an `Error`, keeping its stack when it already is one.
 * A string or object thrown bare is wrapped, with the value stringified as the message.
 * @param error - The thrown value.
 * @returns The value as an `Error`.
 */
export function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}
