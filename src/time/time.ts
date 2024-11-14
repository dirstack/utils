/**
 * Utility functions related to time.
 */
type DateStyle = Intl.DateTimeFormatOptions["dateStyle"]
type TimeStyle = Intl.DateTimeFormatOptions["timeStyle"]
type Timestamp = string | number | Date

const getDateFormatter = (locale: string, dateStyle: DateStyle) => {
  return new Intl.DateTimeFormat(locale, { dateStyle })
}

const getTimeFormatter = (locale: string, timeStyle: TimeStyle) => {
  return new Intl.DateTimeFormat(locale, { timeStyle })
}

const getDateTimeFormatter = (locale: string, dateStyle: DateStyle, timeStyle: TimeStyle) => {
  return new Intl.DateTimeFormat(locale, { dateStyle, timeStyle })
}

/**
 * Formats a date according to the specified options.
 * @param timestamp - The timestamp to format.
 * @param dateStyle - The date formatting style to use. Defaults to 'medium'.
 * @param locale - The locale to use for formatting. Defaults to 'en'.
 * @returns The formatted date string.
 */
export const formatDate = (
  timestamp: Timestamp,
  dateStyle: DateStyle = "medium",
  locale = "en-US",
) => {
  return getDateFormatter(locale, dateStyle).format(new Date(timestamp))
}

/**
 * Formats a time according to the specified options.
 * @param timestamp - The timestamp to format.
 * @param timeStyle - The time formatting style to use. Defaults to 'short'.
 * @param locale - The locale to use for formatting. Defaults to 'en'.
 * @returns The formatted time string.
 */
export const formatTime = (
  timestamp: Timestamp,
  timeStyle: TimeStyle = "short",
  locale = "en-US",
) => {
  return getTimeFormatter(locale, timeStyle).format(new Date(timestamp))
}

/**
 * Formats a date and time according to the specified options.
 * @param timestamp - The timestamp to format.
 * @param dateStyle - The date formatting style to use. Defaults to 'medium'.
 * @param timeStyle - The time formatting style to use. Defaults to 'short'.
 * @param locale - The locale to use for formatting. Defaults to 'en'.
 * @returns The formatted date and time string.
 */
export const formatDateTime = (
  timestamp: Timestamp,
  dateStyle: DateStyle = "medium",
  timeStyle: TimeStyle = "short",
  locale = "en-US",
) => {
  return getDateTimeFormatter(locale, dateStyle, timeStyle).format(new Date(timestamp))
}

/**
 * Formats a date or time according to the specified options.
 * @param timestamp - The timestamp to format.
 * @param type - The type of formatting to use. Can be 'date', 'time', or 'datetime'.
 * @param dateStyle - The date formatting style to use. Defaults to 'medium'.
 * @param timeStyle - The time formatting style to use. Defaults to 'short'.
 * @param locale - The locale to use for formatting. Defaults to 'en'.
 * @returns The formatted date or time string.
 */
export const formatDateOrTime = (
  timestamp: Timestamp,
  type: "date" | "time" | "datetime",
  dateStyle: DateStyle = "medium",
  timeStyle: TimeStyle = "short",
  locale = "en-US",
) => {
  switch (type) {
    case "date":
      return formatDate(timestamp, dateStyle, locale)
    case "time":
      return formatTime(timestamp, timeStyle, locale)
    default:
      return formatDateTime(timestamp, dateStyle, timeStyle, locale)
  }
}

/**
 * Formats a date range.
 * @param start - The start date.
 * @param end - The end date.
 * @param dateStyle - The date formatting style to use. Defaults to 'medium'.
 * @param locale - The locale to use for formatting. Defaults to 'en'.
 * @returns The formatted date range string.
 */
export const formatDateRange = (
  start: Timestamp,
  end: Timestamp,
  dateStyle: DateStyle = "medium",
  locale = "en-US",
) => {
  return getDateFormatter(locale, dateStyle).formatRange(new Date(start), new Date(end))
}

/**
 * Calculates the estimated read time for a given content.
 * @param content - The content to calculate the read time for.
 * @param wpm - The average words per minute to use for the calculation. Defaults to 265.
 * @returns The estimated read time in minutes.
 */
export const getReadTime = (content: string | null, wpm = 265): number => {
  if (!content) {
    return 0
  }

  return Math.ceil(content.trim().split(/\s+/).length / wpm)
}
