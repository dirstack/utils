/**
 * Fixed-precision number formatting shared by the format and files modules. Not exported from the
 * package root.
 */

import { createBoundedCache } from "./cache.js"

const getCachedFormatter = /* @__PURE__ */ createBoundedCache<Intl.NumberFormat>()

/**
 * Formats a number to a specified number of decimal places, without thousands separators.
 * Whole results drop their fraction (e.g. "1234" not "1234.00"), and values that round
 * to zero never get a minus sign.
 * @param number - The number to format.
 * @param precision - The number of decimal places to format to. Negative values count as 0.
 * @returns The formatted number as a string.
 */
export function formatToDecimals(number: number, precision = 0): string {
  // `Intl.NumberFormat` renders Infinity as "∞", so non-finite values keep their plain form
  if (!Number.isFinite(number)) return String(number)

  const digits = Math.max(0, precision)

  const formatter = getCachedFormatter(
    String(digits),
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
        useGrouping: false,
        trailingZeroDisplay: "stripIfInteger",
        signDisplay: "negative",
      }),
  )

  return formatter.format(number)
}
