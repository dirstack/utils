/**
 * Utility functions for working with files and MIME types.
 */

import { formatToDecimals } from "../format/format"

/**
 * Formats a number of bytes to a human-readable string.
 * @param bytes - The number of bytes to format.
 * @param precision - The number of decimal places to format the size to.
 * @returns The formatted size as a string.
 */
export function formatBytes(bytes: number, precision = 0): string {
  const base = 1024
  const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  // Values below 1 KB are reported in bytes, which are always whole numbers.
  if (bytes < base) return `${bytes} B`

  const exponent = Math.floor(Math.log(bytes) / Math.log(base))
  const size = formatToDecimals(bytes / base ** exponent, precision)

  return `${size} ${units[exponent]}`
}

/**
 * Formats a MIME type string to a more readable format.
 * @param mimeType - The MIME type string to format.
 * @returns The formatted MIME type string.
 */
export function formatMimeType(mimeType: string): string | undefined {
  const [, subtype] = mimeType.split("/")

  return subtype === "*" ? undefined : subtype?.toUpperCase()
}

/**
 * Checks if a MIME type matches any of the provided patterns.
 * Supports wildcard matching for subtypes (e.g., "image/*").
 *
 * @param mimeType - The MIME type to check (e.g., "image/jpeg", "text/plain")
 * @param patterns - Array of MIME type patterns to match against (e.g., ["image/*", "text/plain"])
 * @returns True if the MIME type matches any of the patterns, false otherwise
 *
 * @example
 * ```typescript
 * isMimeTypeMatch("image/jpeg", ["image/*"]) // returns true
 * isMimeTypeMatch("text/plain", ["image/*", "text/plain"]) // returns true
 * isMimeTypeMatch("application/json", ["image/*"]) // returns false
 * ```
 */
export function isMimeTypeMatch(mimeType: string, patterns: string[]) {
  const [type, subtype] = mimeType.split("/")

  return patterns.some(pattern => {
    const [patternType, patternSubtype] = pattern.split("/")

    if (type !== patternType) return false

    return patternSubtype === "*" || subtype === patternSubtype
  })
}

/**
 * Converts a File object to a Base64 encoded string.
 * @param file - The File object to be converted.
 * @returns A promise that resolves with the Base64 encoded string.
 */
export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}
