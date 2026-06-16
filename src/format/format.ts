/**
 * Utility functions for formatting data.
 */

type Notation = Intl.NumberFormatOptions["notation"]
type Currency = Intl.NumberFormatOptions["currency"]

/**
 * Formats a number with thousands separators.
 * @param number - The number to format.
 * @param notation - The notation to use for formatting. Defaults to 'compact'.
 * @param locale - The locale to use for formatting. Defaults to 'en-US'.
 * @returns The formatted number as a string.
 */
export const formatNumber = (number: number, notation: Notation = "compact", locale = "en-US") => {
  const formatter = new Intl.NumberFormat(locale, { notation })

  return formatter.format(number)
}

/**
 * Formats a given amount of money into a currency string.
 * @param amount The amount of money to format.
 * @param currency The currency to format the amount in. Defaults to 'USD'.
 * @param locale - The locale to use for formatting. Defaults to 'en-US'.
 * @returns The formatted currency string.
 */
export const formatCurrency = (amount: number, currency: Currency = "USD", locale = "en-US") => {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  })

  return formatter.format(amount).replace(/\D00(?=\D*$)/, "")
}

/**
 * Formats a given amount with an interval
 * @param amount The amount of money to format.
 * @param interval The interval, either 'month' or 'year'. Defaults to 'month'.
 * @returns The formatted amount per interval.
 */
export const formatIntervalAmount = (amount: number, interval: "month" | "year" = "month") => {
  return formatToDecimals(amount / (interval === "year" ? 12 : 1), 2)
}

/**
 * Formats a number to a specified number of decimal places.
 * @param number - The number to format.
 * @param precision - The number of decimal places to format to.
 * @returns The formatted number as a string.
 */
export const formatToDecimals = (number: number, precision = 0): string => {
  return number.toFixed(precision < 0 ? 0 : precision).replace(/\.0+$/, "")
}

/**
 * Formats a number of bytes to a human-readable string.
 * @param bytes - The number of bytes to format.
 * @param precision - The number of decimal places to format the size to.
 * @returns The formatted size as a string.
 */
export const formatBytes = (bytes: number, precision = 0): string => {
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  // Values below 1 KB are reported in bytes, which are always whole numbers.
  if (bytes < k) {
    return `${bytes} B`
  }

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = formatToDecimals(bytes / k ** i, precision)

  return `${size} ${sizes[i]}`
}

/**
 * Formats a MIME type string to a more readable format.
 * @param mimeType - The MIME type string to format.
 * @returns The formatted MIME type string.
 */
export const formatMimeType = (mimeType: string): string | undefined => {
  const [, subtype] = mimeType.split("/")
  let type: string | undefined

  switch (subtype) {
    case "*":
      return undefined
    default:
      type = subtype
  }

  return type?.toUpperCase()
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
export const isMimeTypeMatch = (mimeType: string, patterns: string[]) => {
  return patterns.some(pattern => {
    // Split type/subtype for both mimeType and pattern
    const [type, subtype] = mimeType.split("/")
    const [pType, pSubtype] = pattern.split("/")

    // Type must match
    if (type !== pType) return false

    // Wildcard matches any subtype
    if (pSubtype === "*") return true

    // Exact subtype match
    return subtype === pSubtype
  })
}
