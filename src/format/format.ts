/**
 * Utility functions for formatting data.
 */

/** Any `Intl.NumberFormat` option, plus a `locale` shortcut. */
export type FormatNumberOptions = Intl.NumberFormatOptions & { locale?: string }

/**
 * Formats a number using `Intl.NumberFormat`.
 * @param number - The number to format.
 * @param options - Any `Intl.NumberFormat` option, plus a `locale` (defaults to 'en-US').
 * @returns The formatted number as a string.
 */
export const formatNumber = (
  number: number,
  { locale = "en-US", ...options }: FormatNumberOptions = {},
) => {
  return new Intl.NumberFormat(locale, options).format(number)
}

/**
 * Formats a number as currency, building on {@link formatNumber}.
 * Uses the narrow currency symbol (e.g. `$` not `US$`) and strips trailing zero
 * fractions for whole amounts (e.g. `$1,000` not `$1,000.00`).
 * @param amount - The amount of money to format.
 * @param options - Any `Intl.NumberFormat` option, plus a `locale`. `currency` defaults to 'USD'.
 * @returns The formatted currency string.
 */
export const formatCurrency = (
  amount: number,
  { currency = "USD", ...options }: FormatNumberOptions = {},
) => {
  return formatNumber(amount, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    trailingZeroDisplay: "stripIfInteger",
    ...options,
  })
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
