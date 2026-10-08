/**
 * Utility functions for working with files and MIME types.
 */

import { formatToDecimals } from "../internal/decimals.js"

/**
 * Formats a number of bytes to a human-readable string, in binary units (1 KB = 1024 B).
 * @param bytes - The number of bytes to format.
 * @param precision - The number of decimal places to format the size to.
 * @returns The formatted size as a string.
 */
export function formatBytes(bytes: number, precision = 0): string {
  const base = 1024
  const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  const largest = units.length - 1

  // Values below 1 KB are reported in bytes, which are always whole numbers.
  if (!Number.isFinite(bytes) || Math.abs(bytes) < base) return `${bytes} B`

  let exponent = Math.min(Math.floor(Math.log(Math.abs(bytes)) / Math.log(base)), largest)
  let size = formatToDecimals(bytes / base ** exponent, precision)

  // Rounding can reach the next unit: 1023.9 KB at precision 0 would read "1024 KB", not "1 MB"
  if (Math.abs(Number(size)) >= base && exponent < largest) {
    exponent++
    size = formatToDecimals(bytes / base ** exponent, precision)
  }

  return `${size} ${units[exponent]}`
}

/**
 * Splits a MIME type into its lowercased type and subtype, dropping parameters such as
 * "; charset=utf-8". A lone "*" counts as "*\/*".
 */
function parseMimeType(value: string) {
  const [type = "", subtype = ""] = (value.split(";")[0] ?? "").trim().toLowerCase().split("/")
  return type === "*" && !subtype ? { type, subtype: "*" } : { type, subtype }
}

/**
 * Checks if a MIME type matches any of the provided patterns.
 * Matching ignores letter case and parameters such as "; charset=utf-8", and supports
 * wildcard subtypes ("image/*") and the match-all pattern ("*\/*" or "*").
 * @param mimeType - The MIME type to check (e.g., "image/jpeg", "text/plain")
 * @param patterns - Array of MIME type patterns to match against (e.g., ["image/*", "text/plain"])
 * @returns True if the MIME type matches any of the patterns, false otherwise
 * @example
 * isMimeTypeMatch("image/jpeg", ["image/*"]) // true
 * isMimeTypeMatch("Text/Plain; charset=utf-8", ["text/plain"]) // true
 * isMimeTypeMatch("application/json", ["image/*"]) // false
 */
export function isMimeTypeMatch(mimeType: string, patterns: readonly string[]): boolean {
  const { type, subtype } = parseMimeType(mimeType)
  if (!type || !subtype) return false

  return patterns.some(pattern => {
    const expected = parseMimeType(pattern)

    return (
      (expected.type === "*" || expected.type === type) &&
      (expected.subtype === "*" || expected.subtype === subtype)
    )
  })
}

/**
 * Reads a file or blob as a Base64 string, without a "data:" prefix.
 * Works in browsers, Node.js and Bun.
 * @param file - The file or blob to read.
 * @returns A promise that resolves with the Base64 encoded contents.
 * @example
 * await toBase64(new Blob(["hi"])) // "aGk="
 */
export async function toBase64(file: Blob): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ""

  // Build the binary string in chunks, because spreading a large array overflows the call stack
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
  }

  return btoa(binary)
}

/**
 * Reads a file or blob as a data URL, such as "data:image/png;base64,iVBOR…".
 * Works in browsers, Node.js and Bun.
 * @param file - The file or blob to read. Its `type` becomes the data URL's media type.
 * @returns A promise that resolves with the data URL.
 */
export async function toDataUrl(file: Blob): Promise<string> {
  return `data:${file.type || "application/octet-stream"};base64,${await toBase64(file)}`
}
