/**
 * Utility functions for working with errors.
 */

/**
 * Gets the error message from an unknown value.
 * A value with a string `message` property, such as an `Error`, returns that message.
 * Anything else is stringified as JSON, or with `String()` when JSON cannot represent it.
 * @param error - The value to get the error message from.
 * @returns The error message as a string.
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    if (typeof error.message === "string") return error.message
  }

  try {
    return JSON.stringify(error) ?? String(error)
  } catch {
    // JSON.stringify throws on circular references and BigInt values
    return String(error)
  }
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
