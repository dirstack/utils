/**
 * Utility functions for working with strings.
 */

import slugifyString from "@sindresorhus/slugify"
import { isTruthy } from "../helpers/helpers.js"
import { createBoundedCache } from "../internal/cache.js"

/**
 * Uppercases the first character in the `string`.
 * @param string - The string to uppercase the first character of.
 * @returns The string with the first character in uppercase.
 */
export function ucFirst(string: string): string {
  if (typeof string !== "string") return ""

  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`
}

/**
 * Lowercases the first character in the `string`.
 * @param string - The string to lowercase the first character of.
 * @returns The string with the first character in lowercase.
 */
export function lcFirst(string: string): string {
  if (typeof string !== "string") return ""

  return `${string.charAt(0).toLowerCase()}${string.slice(1)}`
}

/**
 * Strips HTML tags from a string.
 * @param string - The string to strip tags from.
 * @returns The string without HTML tags.
 */
export function stripHtml(string: string): string {
  return string.replace(/<[^>]*>?/gm, "")
}

/**
 * Replaces each run of newlines in a string.
 * @param string - The string to convert.
 * @param replacement - The text that replaces each run of newlines. Defaults to a space.
 * @returns The string with newlines replaced.
 */
export function convertNewlines(string: string, replacement = " "): string {
  return string.replace(/\n+/g, replacement)
}

/**
 * Gets a plain-text excerpt from a string, stripping HTML and newlines.
 * @param content - The string to get an excerpt from.
 * @param length - The maximum length of the excerpt, before "..." is added. Defaults to 250.
 * @returns The excerpt, ending in "..." when the text was cut, or null for empty content.
 */
export function getExcerpt(content: string | undefined | null, length = 250): string | null {
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
export function isCuid(id: string): boolean {
  return id.length === 25 && id[0] === "c"
}

/**
 * Gets the uppercase initials of each word in a string.
 * @param value - The string to get the initials from.
 * @param limit - The maximum number of initials to return. 0 means no limit.
 * @returns The initials from the string.
 */
export function getInitials(value?: string | null, limit = 0): string {
  const trimmed = (value ?? "").trim()

  // Two characters or fewer are treated as initials already.
  if (trimmed.length <= 2) return trimmed.toUpperCase()

  const words = trimmed.split(" ").filter(isTruthy)
  const initials = words.map(word => word.charAt(0).toUpperCase()).join("")

  return limit > 0 ? initials.slice(0, limit) : initials
}

/** Options for {@link joinAsSentence}. */
export interface JoinAsSentenceOptions {
  /** "and" lists (default) or "or" lists. */
  type?: "conjunction" | "disjunction"
  /** BCP 47 locale for the list's words and punctuation. Defaults to "en-US", like formatNumber and formatDate. */
  locale?: string
  /** Show at most this many items; the rest collapse into one trailing item. No limit by default. */
  limit?: number
  /** The trailing item for the collapsed rest. Defaults to `${count} more`. */
  formatRest?: (count: number) => string
}

const getCachedListFormat = /* @__PURE__ */ createBoundedCache<Intl.ListFormat>()

/**
 * Joins strings into a sentence with `Intl.ListFormat`, such as "a, b, and c".
 * The locale sets the words and punctuation, and each item is kept whole, so items may contain commas.
 * `en-US` adds a serial comma before the last item; pass `locale: "en-GB"` for "a, b and c".
 * Formatters are cached by locale and type.
 * @param items - The strings to join.
 * @param options - The list type, locale, item limit and rest label.
 * @returns The joined sentence, or an empty string for no items.
 * @example
 * joinAsSentence(["a", "b", "c"]) // "a, b, and c"
 * joinAsSentence(["a", "b", "c"], { locale: "en-GB" }) // "a, b and c"
 * joinAsSentence(["a", "b"], { type: "disjunction" }) // "a or b"
 *
 * // A limit collapses the rest into one item, but never hides a single item
 * joinAsSentence(["a", "b", "c", "d"], { limit: 2 }) // "a, b, and 2 more"
 * joinAsSentence(["a", "b", "c"], { limit: 2 }) // "a, b, and c"
 */
export function joinAsSentence(
  items: readonly string[],
  {
    type = "conjunction",
    locale = "en-US",
    limit = Number.POSITIVE_INFINITY,
    formatRest = count => `${count} more`,
  }: JoinAsSentenceOptions = {},
): string {
  const formatter = getCachedListFormat(
    `${locale}:${type}`,
    () => new Intl.ListFormat(locale, { type, style: "long" }),
  )

  const shown = Math.max(0, limit)
  const hidden = items.length - shown

  // "1 more" is never shorter than the item it hides, so only collapse two or more items
  if (hidden < 2) return formatter.format(items)

  return formatter.format([...items.slice(0, shown), formatRest(hidden)])
}
