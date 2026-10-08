/**
 * Utility functions related to time.
 */
import { createBoundedCache, serializeOptions } from "../internal/cache.js"

type Timestamp = string | number | Date

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

const getCachedFormatter = /* @__PURE__ */ createBoundedCache<Intl.DateTimeFormat>()

function getFormatter(
  { locale = DEFAULT_LOCALE, ...options }: FormatDateOptions,
  defaults: Pick<Intl.DateTimeFormatOptions, "dateStyle" | "timeStyle">,
) {
  if (!FIELD_OPTIONS.some(key => options[key] !== undefined)) {
    options.dateStyle ??= defaults.dateStyle
    options.timeStyle ??= defaults.timeStyle
  }

  return getCachedFormatter(
    `${locale}:${serializeOptions(options)}`,
    () => new Intl.DateTimeFormat(locale, options),
  )
}

/**
 * Formats a date.
 * @param timestamp - The timestamp to format.
 * @param options - Any `Intl.DateTimeFormat` option, plus a `locale` (defaults to 'en-US').
 * When no date or time fields are set, `dateStyle` defaults to 'medium'.
 * @returns The formatted date string.
 * @example
 * formatDate("2026-10-05T12:00:00Z") // "Oct 5, 2026" (in the runtime's time zone)
 * formatDate("2026-10-05T12:00:00Z", { dateStyle: "long", locale: "en-GB" }) // "5 October 2026"
 *
 * // Server-rendered pages: pin the time zone so server and browser output match
 * formatDate("2026-10-05", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC", locale: "en-GB" }) // "05 Oct 2026"
 */
export function formatDate(timestamp: Timestamp, options: FormatDateOptions = {}): string {
  return getFormatter(options, { dateStyle: "medium" }).format(new Date(timestamp))
}

/**
 * Formats a time.
 * @param timestamp - The timestamp to format.
 * @param options - Any `Intl.DateTimeFormat` option, plus a `locale` (defaults to 'en-US').
 * When no date or time fields are set, `timeStyle` defaults to 'short'.
 * @returns The formatted time string.
 * @example
 * formatTime("2026-10-05T23:30:00Z", { timeZone: "UTC" }) // "11:30 PM"
 * formatTime("2026-10-05T23:30:00Z", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" }) // "23:30"
 */
export function formatTime(timestamp: Timestamp, options: FormatDateOptions = {}): string {
  return getFormatter(options, { timeStyle: "short" }).format(new Date(timestamp))
}

/**
 * Formats a date and time.
 * @param timestamp - The timestamp to format.
 * @param options - Any `Intl.DateTimeFormat` option, plus a `locale` (defaults to 'en-US').
 * When no date or time fields are set, `dateStyle` defaults to 'medium' and `timeStyle` to 'short'.
 * @returns The formatted date and time string.
 * @example
 * formatDateTime("2026-10-05T23:30:00Z", { timeZone: "UTC" }) // "Oct 5, 2026 at 11:30 PM"
 */
export function formatDateTime(timestamp: Timestamp, options: FormatDateOptions = {}): string {
  return getFormatter(options, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(timestamp),
  )
}

/**
 * Formats a date range.
 * @param start - The start date.
 * @param end - The end date.
 * @param options - Any `Intl.DateTimeFormat` option, plus a `locale` (defaults to 'en-US').
 * When no date or time fields are set, `dateStyle` defaults to 'medium'.
 * @returns The formatted date range string.
 * @example
 * formatDateRange("2026-10-05", "2026-10-09", { timeZone: "UTC" }) // "Oct 5 – 9, 2026"
 */
export function formatDateRange(
  start: Timestamp,
  end: Timestamp,
  options: FormatDateOptions = {},
): string {
  return getFormatter(options, { dateStyle: "medium" }).formatRange(new Date(start), new Date(end))
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

  const words = content.split(/\s+/).filter(Boolean).length
  return Math.ceil(words / wpm)
}

/** One second in milliseconds. */
export const SECOND_MS = 1000

/** One minute in milliseconds. */
export const MINUTE_MS = 60_000

/** One hour in milliseconds. */
export const HOUR_MS = 3_600_000

/**
 * One day in milliseconds. A UTC day: a local day across a daylight-saving change is an hour
 * longer or shorter, so calendar arithmetic in a time zone needs a date library.
 */
export const DAY_MS = 86_400_000

/** One minute in seconds, for Unix timestamps. */
export const MINUTE_SECONDS = 60

/** One hour in seconds, for Unix timestamps. */
export const HOUR_SECONDS = 3600

/** One day in seconds, for Unix timestamps. */
export const DAY_SECONDS = 86_400

/**
 * Converts a Unix timestamp, in seconds (as Stripe and JWTs write it), to a date.
 * @param seconds - The Unix timestamp in seconds.
 * @returns The date.
 */
export function fromUnix(seconds: number): Date {
  return new Date(seconds * 1000)
}

/**
 * Converts a date to a Unix timestamp in whole seconds.
 * @param timestamp - The timestamp to convert.
 * @returns The Unix timestamp in seconds, rounded down.
 */
export function toUnix(timestamp: Timestamp): number {
  return Math.floor(new Date(timestamp).getTime() / 1000)
}

/**
 * Gets the UTC calendar day of a timestamp as "YYYY-MM-DD".
 * @param timestamp - The timestamp.
 * @returns The day key.
 * @example
 * dayKey("2026-10-05T23:30:00Z") // "2026-10-05"
 */
export function dayKey(timestamp: Timestamp): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

/**
 * Moves a "YYYY-MM-DD" day key by whole days.
 * @param day - The day key.
 * @param days - How many days to move, negative to move back.
 * @returns The new day key.
 * @example
 * shiftDayKey("2026-12-31", 1) // "2027-01-01"
 */
export function shiftDayKey(day: string, days: number): string {
  return dayKey(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS)
}

const getCachedDayFormatter = /* @__PURE__ */ createBoundedCache<Intl.DateTimeFormat>()

/**
 * Gets the calendar day a timestamp falls on in a time zone, as "YYYY-MM-DD".
 * @param timestamp - The timestamp.
 * @param timeZone - An IANA time zone, such as 'Europe/Warsaw'.
 * @returns The day key in that time zone.
 * @example
 * dayIn("2026-10-05T23:30:00Z", "Asia/Tokyo") // "2026-10-06"
 */
export function dayIn(timestamp: Timestamp, timeZone: string): string {
  const formatter = getCachedDayFormatter(
    timeZone,
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
  )
  const parts = formatter.formatToParts(new Date(timestamp))
  const { year, month, day } = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${year}-${month}-${day}`
}
