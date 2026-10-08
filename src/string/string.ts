/**
 * Utility functions for working with strings.
 */

import slugifyString from "@sindresorhus/slugify"
import { isTruthy } from "../helpers/helpers.js"

/**
 * Uppercases the first character in the `string`.
 * @param string - The string to uppercase the first character of.
 * @returns The string with the first character in uppercase.
 */
export function ucFirst(string: string) {
  if (typeof string !== "string") return ""

  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`
}

/**
 * Lowercases the first character in the `string`.
 * @param string - The string to lowercase the first character of.
 * @returns The string with the first character in lowercase.
 */
export function lcFirst(string: string) {
  if (typeof string !== "string") return ""

  return `${string.charAt(0).toLowerCase()}${string.slice(1)}`
}

/**
 * Strips HTML tags from a string.
 * @param string - The string to strip tags from.
 * @returns The string without HTML tags.
 */
export function stripHtml(string: string) {
  return string.replace(/<[^>]*>?/gm, "")
}

/**
 * Replaces each run of newlines in a string.
 * @param string - The string to convert.
 * @param replacement - The text that replaces each run of newlines. Defaults to a space.
 * @returns The string with newlines replaced.
 */
export function convertNewlines(string: string, replacement = " ") {
  return string.replace(/\n+/g, replacement)
}

/**
 * Gets a plain-text excerpt from a string, stripping HTML and newlines.
 * @param content - The string to get an excerpt from.
 * @param length - The maximum length of the excerpt, before "..." is added. Defaults to 250.
 * @returns The excerpt, ending in "..." when the text was cut, or null for empty content.
 */
export function getExcerpt(content: string | undefined | null, length = 250) {
  if (!content) return null

  const plainText = convertNewlines(stripHtml(content))
  const text = plainText.slice(0, length).trim()

  return text.length < plainText.length ? `${text}...` : text
}

/**
 * Converts a string into a slug. "#" becomes "sharp" and "+" becomes "plus".
 * @param input - The string to slugify.
 * @param decamelize - Whether to decamelize the string. Defaults to false.
 * @returns The slugified string.
 */
export function slugify(input: string, decamelize = false): string {
  return slugifyString(input, {
    decamelize,
    customReplacements: [
      ["#", "sharp"],
      ["+", "plus"],
    ],
  })
}

/**
 * Checks if a string looks like a cuid: 25 characters starting with "c".
 * @param id - The string to check.
 * @returns A boolean indicating if the string is a cuid.
 */
export function isCuid(id: string) {
  return id.length === 25 && id[0] === "c"
}

/**
 * Gets the uppercase initials of each word in a string.
 * @param value - The string to get the initials from.
 * @param limit - The maximum number of initials to return. 0 means no limit.
 * @returns The initials from the string.
 */
export function getInitials(value?: string | null, limit = 0) {
  const trimmed = (value ?? "").trim()

  // Two characters or fewer are treated as initials already.
  if (trimmed.length <= 2) return trimmed.toUpperCase()

  const words = trimmed.split(" ").filter(isTruthy)
  const initials = words.map(word => word.charAt(0).toUpperCase()).join("")

  return limit > 0 ? initials.slice(0, limit) : initials
}

/**
 * Joins an array of strings into a sentence, such as "a, b and c".
 * @param items - The strings to join.
 * @param maxItems - The maximum number of items to include. Defaults to 3.
 * @param conjunction - The word before the last item. Defaults to "and".
 * @returns The joined sentence.
 */
export function joinAsSentence(items: string[], maxItems = 3, conjunction = "and") {
  return items
    .slice(0, maxItems)
    .join(", ")
    .replace(/, ([^,]*)$/, ` ${conjunction} $1`)
}
