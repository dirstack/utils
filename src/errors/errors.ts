/**
 * Utility functions for working with errors.
 */

/**
 * Gets a readable message from a thrown value.
 * An `Error` (or any object with a non-empty string `message`) returns its message, and a
 * non-empty string returns itself. Anything else returns `fallback` when one is given, and is
 * stringified otherwise.
 * @param error - The thrown value.
 * @param fallback - The message to use when the value carries no message of its own.
 * @returns The error message.
 * @example
 * getErrorMessage(new Error("Upload failed")) // "Upload failed"
 * getErrorMessage({ code: 500 }, "Something went wrong") // "Something went wrong"
 */
export function getErrorMessage(error: unknown, fallback?: string): string {
  if (typeof error === "string" && error) return error

  if (typeof error === "object" && error !== null && "message" in error) {
    if (typeof error.message === "string" && error.message) return error.message
  }

  if (fallback !== undefined) return fallback

  try {
    return JSON.stringify(error) ?? String(error)
  } catch {
    // JSON.stringify throws on circular references and BigInt values
    return String(error)
  }
}

/**
 * Converts a thrown value to an `Error`, keeping its stack when it already is one.
 * Anything else is wrapped: the message comes from {@link getErrorMessage}, and the original
 * value is kept as the error's `cause`.
 * @param error - The thrown value.
 * @returns The value as an `Error`.
 */
export function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(getErrorMessage(error), { cause: error })
}
