import slugifyString from "@sindresorhus/slugify"
import { isTruthy } from "../helpers/helpers"

/**
 * Utility functions for working with strings.
 */

/**
 * Uppercases the first character in the `string`.
 * @param string - The string to uppercase the first character of.
 * @returns The string with the first character in uppercase.
 */
export const ucFirst = (string: string) => {
  if (typeof string !== "string") {
    return ""
  }

  if (string.length === 0) {
    return string
  }

  return string[0]?.toUpperCase() + string.slice(1)
}

/**
 * Lowercases the first character in the `string`.
 * @param string - The string to lowercase the first character of.
 * @returns The string with the first character in lowercase.
 */
export const lcFirst = (string: string) => {
  if (typeof string !== "string") {
    return ""
  }

  if (string.length === 0) {
    return string
  }

  return string[0]?.toLowerCase() + string.slice(1)
}

/**
 * Strip html tags from a string
 * @param string - string to strip tags from
 * @returns string without html tags
 */
export const stripHtml = (string: string) => {
  return string.replace(/<[^>]*>?/gm, "")
}

/**
 * Convert newlines to specified element
 * @param string - string to convert
 * @param replacement - replacement to convert newlines to
 * @returns string with newlines converted to specified element
 */
export const convertNewlines = (string: string, replacement = " ") => {
  return string.replace(/\n+/g, replacement)
}

/**
 * Get an excerpt from a string
 * @param content - The string to get an excerpt from
 * @param length - The length of the excerpt
 * @returns An excerpt from the string
 */
export const getExcerpt = (content: string | undefined | null, length = 250) => {
  if (!content) {
    return null
  }

  const plainText = convertNewlines(stripHtml(content))
  const text = plainText.slice(0, length).trim()

  if (text.length < plainText.length) {
    return `${text}...`
  }

  return text
}

/**
 * Converts a string into a slugified version.
 *
 * @param input The string to be slugified.
 * @param decamelize Whether to decamelize the string. Defaults to false.
 * @returns The slugified string.
 */
export const slugify = (input: string, decamelize = false): string => {
  return slugifyString(input, {
    decamelize,
    customReplacements: [
      ["#", "sharp"],
      ["+", "plus"],
    ],
  })
}

/**
 * Check if a given string is a valid cuid
 * @param id A string to check
 * @returns A boolean indicating if the string is a cuid
 */
export const isCuid = (id: string) => {
  return id.length === 25 && id[0] === "c"
}

/**
 * Get the initials from a string
 * @param value A string to get the initials from
 * @param limit The maximum number of initials to return
 * @returns The initials from the string
 */
export const getInitials = (value?: string | null, limit = 0) => {
  const val = (value || "").trim()

  // If the value is empty, a single character, or two characters (already initials)
  if (val.length === 0 || val.length === 1 || val.length === 2) {
    return val.toUpperCase()
  }

  const values = val.split(" ").filter(isTruthy)
  const initials = values.map(name => name.charAt(0).toUpperCase()).join("")

  if (limit > 0) {
    return initials.slice(0, limit)
  }

  return initials
}

/**
 * Joins an array of strings into a sentence, with a maximum of 3 items.
 *
 * @param items The array of strings to be joined.
 * @param maxItems The maximum number of items to include in the sentence.
 * @returns The joined sentence.
 */
export const joinAsSentence = (items: string[], maxItems = 3, lastItem = "and") => {
  return items
    .slice(0, maxItems)
    .join(", ")
    .replace(/, ([^,]*)$/, ` ${lastItem} $1`)
}
