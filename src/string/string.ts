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

/** Options for {@link truncate}. */
export interface TruncateOptions {
  /** The text that marks the cut. It counts toward the length. Defaults to "…". */
  ellipsis?: string
  /** Cut after the last whole word that fits (default), or exactly at the length. */
  wordBoundary?: boolean
}

// Created on first use, so importing the module has no side effects
let segmenter: Intl.Segmenter | undefined

/**
 * Splits text into user-perceived characters, so an emoji or an accented letter is never cut apart.
 */
function toGraphemes(text: string) {
  segmenter ??= new Intl.Segmenter()
  return Array.from(segmenter.segment(text), ({ segment }) => segment)
}

/**
 * Shortens plain text to at most `length` characters, ending with an ellipsis when it was cut.
 * Runs of whitespace and newlines become single spaces first. Characters are counted as the
 * reader sees them, so an emoji counts as one and is never split.
 * @param text - The text to shorten. `null` and `undefined` count as empty.
 * @param length - The maximum length of the result, including the ellipsis.
 * @param options - The ellipsis, and whether to cut between words.
 * @returns The text, shortened when it is longer than `length`.
 * @example
 * truncate("The quick brown fox jumps", 15) // "The quick…"
 * truncate("The quick brown fox jumps", 15, { wordBoundary: false }) // "The quick brow…"
 */
export function truncate(
  text: string | null | undefined,
  length: number,
  { ellipsis = "…", wordBoundary = true }: TruncateOptions = {},
): string {
  const plain = (text ?? "").replace(/\s+/g, " ").trim()
  const characters = toGraphemes(plain)

  if (characters.length <= length) return plain

  const marker = toGraphemes(ellipsis)
  if (length <= marker.length) return marker.slice(0, Math.max(length, 0)).join("")

  const room = length - marker.length
  let cut = characters.slice(0, room).join("")

  // Back up to the last space, unless the cut already falls between two words
  if (wordBoundary && characters[room] !== " ") {
    const lastSpace = cut.lastIndexOf(" ")
    if (lastSpace > 0) cut = cut.slice(0, lastSpace)
  }

  return `${cut.replace(/[\s,;:]+$/, "")}${ellipsis}`
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
