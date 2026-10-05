/**
 * Utility functions related to time.
 */
type DateStyle = Intl.DateTimeFormatOptions["dateStyle"]
type TimeStyle = Intl.DateTimeFormatOptions["timeStyle"]
type Timestamp = string | number | Date
type DateOrTimeType = "date" | "time" | "datetime"

/**
 * Any `Intl.DateTimeFormat` option, plus a `locale` shortcut (defaults to 'en-US').
 * Set `timeZone` (e.g. 'UTC') to get the same output on the server and in the browser.
 */
export type FormatDateOptions = Intl.DateTimeFormatOptions & { locale?: string }

const DEFAULT_LOCALE = "en-US"

// Options that pick date or time fields. When any of these are set, no default style is added,
// because `Intl.DateTimeFormat` throws when `dateStyle`/`timeStyle` are mixed with them.
const FIELD_OPTIONS = [
  "weekday",
  "era",
  "year",
  "month",
  "day",
  "dayPeriod",
  "hour",
  "minute",
  "second",
  "fractionalSecondDigits",
  "timeZoneName",
] as const

// Caps the cache so request-derived locales or time zones cannot grow it without limit
const FORMATTER_CACHE_LIMIT = 100
const formatterCache = new Map<string, Intl.DateTimeFormat>()

function getFormatter(
  { locale = DEFAULT_LOCALE, ...options }: FormatDateOptions,
  defaults: Pick<Intl.DateTimeFormatOptions, "dateStyle" | "timeStyle">,
) {
  if (!FIELD_OPTIONS.some(key => options[key] !== undefined)) {
    options.dateStyle ??= defaults.dateStyle
    options.timeStyle ??= defaults.timeStyle
  }

  // Sorted keys make the cache key independent of the order the options were written in
  const key = `${locale}:${JSON.stringify(options, Object.keys(options).sort())}`
  let formatter = formatterCache.get(key)

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options)

    // Maps keep insertion order, so the first key is the oldest entry
    if (formatterCache.size >= FORMATTER_CACHE_LIMIT) {
      formatterCache.delete(formatterCache.keys().next().value!)
    }

    formatterCache.set(key, formatter)
  }

  return formatter
}

/**
 * Formats a date.
 * Accepts either an options object or the legacy positional `dateStyle` and `locale` arguments.
 * @param timestamp - The timestamp to format.
 * @param options - Any `Intl.DateTimeFormat` option, plus a `locale` (defaults to 'en-US').
 * When no date or time fields are set, `dateStyle` defaults to 'medium'.
 * Alternatively, a `dateStyle` preset string (defaults to 'medium').
 * @param locale - The locale to use with a `dateStyle` preset. Defaults to 'en-US'.
 * @returns The formatted date string.
 * @example
 * formatDate("2026-10-05T12:00:00Z") // "Oct 5, 2026" (in the runtime's time zone)
 * formatDate("2026-10-05T12:00:00Z", "long", "en-GB") // "5 October 2026"
 *
 * // Server-rendered pages: pin the time zone so server and browser output match
 * formatDate("2026-10-05", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC", locale: "en-GB" }) // "05 Oct 2026"
 */
export function formatDate(timestamp: Timestamp, options?: FormatDateOptions): string
export function formatDate(timestamp: Timestamp, dateStyle?: DateStyle, locale?: string): string
export function formatDate(
  timestamp: Timestamp,
  options?: DateStyle | FormatDateOptions,
  locale?: string,
) {
  const resolved = typeof options === "object" ? options : { dateStyle: options, locale }
  return getFormatter(resolved, { dateStyle: "medium" }).format(new Date(timestamp))
}

/**
 * Formats a time.
 * Accepts either an options object or the legacy positional `timeStyle` and `locale` arguments.
 * @param timestamp - The timestamp to format.
 * @param options - Any `Intl.DateTimeFormat` option, plus a `locale` (defaults to 'en-US').
 * When no date or time fields are set, `timeStyle` defaults to 'short'.
 * Alternatively, a `timeStyle` preset string (defaults to 'short').
 * @param locale - The locale to use with a `timeStyle` preset. Defaults to 'en-US'.
 * @returns The formatted time string.
 * @example
 * formatTime("2026-10-05T23:30:00Z", { timeZone: "UTC" }) // "11:30 PM"
 * formatTime("2026-10-05T23:30:00Z", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" }) // "23:30"
 */
export function formatTime(timestamp: Timestamp, options?: FormatDateOptions): string
export function formatTime(timestamp: Timestamp, timeStyle?: TimeStyle, locale?: string): string
export function formatTime(
  timestamp: Timestamp,
  options?: TimeStyle | FormatDateOptions,
  locale?: string,
) {
  const resolved = typeof options === "object" ? options : { timeStyle: options, locale }
  return getFormatter(resolved, { timeStyle: "short" }).format(new Date(timestamp))
}

/**
 * Formats a date and time.
 * Accepts either an options object or the legacy positional `dateStyle`, `timeStyle` and `locale` arguments.
 * @param timestamp - The timestamp to format.
 * @param options - Any `Intl.DateTimeFormat` option, plus a `locale` (defaults to 'en-US').
 * When no date or time fields are set, `dateStyle` defaults to 'medium' and `timeStyle` to 'short'.
 * Alternatively, a `dateStyle` preset string (defaults to 'medium').
 * @param timeStyle - The `timeStyle` preset to use with a `dateStyle` preset. Defaults to 'short'.
 * @param locale - The locale to use with a `dateStyle` preset. Defaults to 'en-US'.
 * @returns The formatted date and time string.
 * @example
 * formatDateTime("2026-10-05T23:30:00Z", { timeZone: "UTC" }) // "Oct 5, 2026 at 11:30 PM"
 */
export function formatDateTime(timestamp: Timestamp, options?: FormatDateOptions): string
export function formatDateTime(
  timestamp: Timestamp,
  dateStyle?: DateStyle,
  timeStyle?: TimeStyle,
  locale?: string,
): string
export function formatDateTime(
  timestamp: Timestamp,
  options?: DateStyle | FormatDateOptions,
  timeStyle?: TimeStyle,
  locale?: string,
) {
  const resolved = typeof options === "object" ? options : { dateStyle: options, timeStyle, locale }
  return getFormatter(resolved, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(timestamp),
  )
}

/**
 * Formats a date, a time, or both, depending on `type`.
 * Accepts either an options object or the legacy positional `dateStyle`, `timeStyle` and `locale` arguments.
 * @param timestamp - The timestamp to format.
 * @param type - The type of formatting to use. Can be 'date', 'time', or 'datetime'.
 * @param options - Any `Intl.DateTimeFormat` option, plus a `locale` (defaults to 'en-US').
 * Missing presets default to `dateStyle` 'medium' and `timeStyle` 'short'.
 * Alternatively, a `dateStyle` preset string (defaults to 'medium').
 * @param timeStyle - The `timeStyle` preset to use with a `dateStyle` preset. Defaults to 'short'.
 * @param locale - The locale to use with a `dateStyle` preset. Defaults to 'en-US'.
 * @returns The formatted date or time string.
 * @example
 * formatDateOrTime("2026-10-05T23:30:00Z", "date", { timeZone: "UTC" }) // "Oct 5, 2026"
 */
export function formatDateOrTime(
  timestamp: Timestamp,
  type: DateOrTimeType,
  options?: FormatDateOptions,
): string
export function formatDateOrTime(
  timestamp: Timestamp,
  type: DateOrTimeType,
  dateStyle?: DateStyle,
  timeStyle?: TimeStyle,
  locale?: string,
): string
export function formatDateOrTime(
  timestamp: Timestamp,
  type: DateOrTimeType,
  options?: DateStyle | FormatDateOptions,
  timeStyle?: TimeStyle,
  locale?: string,
) {
  if (typeof options !== "object") {
    switch (type) {
      case "date":
        return formatDate(timestamp, options, locale)
      case "time":
        return formatTime(timestamp, timeStyle, locale)
      default:
        return formatDateTime(timestamp, options, timeStyle, locale)
    }
  }

  switch (type) {
    case "date":
      return formatDate(timestamp, options)
    case "time":
      return formatTime(timestamp, options)
    default:
      return formatDateTime(timestamp, options)
  }
}

/**
 * Formats a date range.
 * Accepts either an options object or the legacy positional `dateStyle` and `locale` arguments.
 * @param start - The start date.
 * @param end - The end date.
 * @param options - Any `Intl.DateTimeFormat` option, plus a `locale` (defaults to 'en-US').
 * When no date or time fields are set, `dateStyle` defaults to 'medium'.
 * Alternatively, a `dateStyle` preset string (defaults to 'medium').
 * @param locale - The locale to use with a `dateStyle` preset. Defaults to 'en-US'.
 * @returns The formatted date range string.
 * @example
 * formatDateRange("2026-10-05", "2026-10-09", { timeZone: "UTC" }) // "Oct 5 – 9, 2026"
 */
export function formatDateRange(
  start: Timestamp,
  end: Timestamp,
  options?: FormatDateOptions,
): string
export function formatDateRange(
  start: Timestamp,
  end: Timestamp,
  dateStyle?: DateStyle,
  locale?: string,
): string
export function formatDateRange(
  start: Timestamp,
  end: Timestamp,
  options?: DateStyle | FormatDateOptions,
  locale?: string,
) {
  const resolved = typeof options === "object" ? options : { dateStyle: options, locale }
  return getFormatter(resolved, { dateStyle: "medium" }).formatRange(new Date(start), new Date(end))
}

/**
 * Calculates the estimated read time for a given content.
 * @param content - The content to calculate the read time for.
 * @param wpm - The average words per minute to use for the calculation. Defaults to 265.
 * @returns The estimated read time in minutes.
 */
export function getReadTime(content: string | null, wpm = 265): number {
  if (!content) {
    return 0
  }

  return Math.ceil(content.trim().split(/\s+/).length / wpm)
}
