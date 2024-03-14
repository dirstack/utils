/**
 * Utility functions for formatting data.
 */

type Currency = Intl.NumberFormatOptions["currency"]

/**
 * Formats a given amount of money into a currency string.
 * @param amount The amount of money to format.
 * @param currency The currency to format the amount in. Defaults to 'USD'.
 * @returns The formatted currency string.
 */
export const formatCurrency = (amount: number, currency: Currency = "USD") => {
  const formatter = new Intl.NumberFormat("en-US", {
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
  return number.toFixed(precision < 0 ? 0 : precision).replace(/\.0+$/, '')
}

/**
 * Formats a number of bytes to a human-readable string.
 * @param bytes - The number of bytes to format.
 * @param precision - The number of decimal places to format the size to.
 * @returns The formatted size as a string.
 */
export const formatBytes = (bytes: number, precision = 0): string => {
  if (bytes === 0) {
    return "0 Bytes"
  }

  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = formatToDecimals(bytes / k ** i, precision)
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

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
