/**
 * Utility functions for formatting data.
 */
import { createBoundedCache, serializeOptions } from "../internal/cache.js"

/** Any `Intl.NumberFormat` option, plus a `locale` shortcut. */
export type FormatNumberOptions = Intl.NumberFormatOptions & { locale?: string }

const getCachedFormatter = /* @__PURE__ */ createBoundedCache<Intl.NumberFormat>()

/**
 * Formats a number using `Intl.NumberFormat`.
 * Formatter instances are cached by locale and options.
 * @param number - The number to format.
 * @param options - Any `Intl.NumberFormat` option, plus a `locale` (defaults to 'en-US').
 * @returns The formatted number as a string.
 */
export function formatNumber(
  number: number,
  { locale = "en-US", ...options }: FormatNumberOptions = {},
): string {
  const formatter = getCachedFormatter(
    `${locale}:${serializeOptions(options)}`,
    () => new Intl.NumberFormat(locale, options),
  )

  return formatter.format(number)
}

/**
 * Formats a number as currency, building on {@link formatNumber}.
 * Uses the narrow currency symbol (e.g. `$` not `US$`) and strips trailing zero
 * fractions for whole amounts (e.g. `$1,000` not `$1,000.00`).
 * @param amount - The amount of money to format.
 * @param options - Any `Intl.NumberFormat` option, plus a `locale`. `currency` defaults to 'USD'.
 * @returns The formatted currency string.
 */
export function formatCurrency(
  amount: number,
  { currency = "USD", ...options }: FormatNumberOptions = {},
): string {
  return formatNumber(amount, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    trailingZeroDisplay: "stripIfInteger",
    ...options,
  })
}

/**
 * Formats the monthly equivalent of an amount, to 2 decimal places.
 * A yearly amount is divided by 12. A monthly amount is formatted as is.
 * @param amount - The amount of money for the interval.
 * @param interval - The interval the amount covers, either 'month' or 'year'. Defaults to 'month'.
 * @returns The formatted monthly amount, for example "83.33" for 1000 per year.
 */
export function formatIntervalAmount(amount: number, interval: "month" | "year" = "month"): string {
  return formatToDecimals(amount / (interval === "year" ? 12 : 1), 2)
}

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

  return formatNumber(number, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: false,
    trailingZeroDisplay: "stripIfInteger",
    signDisplay: "negative",
  })
}

const getCachedExponent = /* @__PURE__ */ createBoundedCache<number>()

/**
 * Gets a currency's minor-unit exponent (USD 2, JPY 0, KWD 3) from the runtime's ISO 4217 data.
 * Useful when amounts are stored in minor units, such as cents.
 * @param currency - The ISO 4217 currency code.
 * @returns The number of decimal places the currency uses.
 */
export function currencyExponent(currency: string): number {
  return getCachedExponent(currency, () => {
    const { maximumFractionDigits } = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).resolvedOptions()

    // ISO 4217 itself falls back to 2 for a currency without an explicit exponent
    return maximumFractionDigits ?? 2
  })
}

/**
 * Gets how many minor units make one major unit of a currency.
 * @param currency - The ISO 4217 currency code.
 * @returns The divisor: 100 for USD, 1 for JPY, 1000 for KWD.
 * @example
 * 12_950 / minorUnits("USD") // 129.5
 */
export function minorUnits(currency: string): number {
  return 10 ** currencyExponent(currency)
}
