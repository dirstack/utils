/**
 * A collection of array utilities.
 */

import { isTruthy } from "../helpers/helpers.js"

/**
 * A utility function that generates an array of numbers within a specified range.
 * @param start - The starting number of the range.
 * @param end - The ending number of the range.
 * @returns An array of numbers within the specified range.
 */
export function range(start: number, end: number) {
  const length = end - start + 1

  return Array.from({ length }, (_, index) => index + start)
}

/**
 * Removes duplicate items, keyed by the value returned from `key`. The first
 * item seen for each key wins, so ordering is preserved and earlier items take
 * precedence over later duplicates.
 * @param items - The array to deduplicate.
 * @param key - Maps an item to the value identifying its uniqueness.
 * @returns A new array with duplicates removed.
 */
export function uniqBy<T, K>(items: readonly T[], key: (item: T) => K): T[] {
  const seen = new Set<K>()

  return items.filter(item => {
    const itemKey = key(item)
    if (seen.has(itemKey)) return false
    seen.add(itemKey)
    return true
  })
}

/**
 * Removes duplicate primitive items using strict equality. First occurrence wins.
 * @param items - The array to deduplicate.
 * @returns A new array with duplicates removed.
 */
export function uniq<T>(items: readonly T[]): T[] {
  return [...new Set(items)]
}

/**
 * Splits an array into chunks of a specified size. The final chunk holds the
 * remainder when the length isn't an exact multiple of `size`.
 * @param items - The array to split.
 * @param size - The maximum size of each chunk.
 * @returns An array of chunks.
 */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = []

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }

  return chunks
}

/**
 * Groups items into an object of arrays, keyed by the value returned from `key`.
 * @param items - The array to group.
 * @param key - Maps an item to its group key.
 * @returns An object mapping each key to the items that produced it.
 */
export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  key: (item: T) => K,
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>

  for (const item of items) {
    const groupKey = key(item)
    groups[groupKey] ??= []
    groups[groupKey].push(item)
  }

  return groups
}

/**
 * Indexes items into an object keyed by the value returned from `key`. When
 * multiple items share a key, the last one wins.
 * @param items - The array to index.
 * @param key - Maps an item to its key.
 * @param value - Maps an item to the value stored under its key. Stores the whole item by default.
 * @returns An object mapping each key to a single item, or to the value returned from `value`.
 * @example
 * keyBy(users, user => user.id) // { u1: { id: "u1", name: "Ada" } }
 * keyBy(users, user => user.id, user => user.name) // { u1: "Ada" }
 */
export function keyBy<T, K extends PropertyKey>(
  items: readonly T[],
  key: (item: T) => K,
): Record<K, T>
export function keyBy<T, K extends PropertyKey, V>(
  items: readonly T[],
  key: (item: T) => K,
  value: (item: T) => V,
): Record<K, V>
export function keyBy<T, K extends PropertyKey, V>(
  items: readonly T[],
  key: (item: T) => K,
  value?: (item: T) => V,
): Record<K, T | V> {
  const indexed = {} as Record<K, T | V>

  for (const item of items) {
    indexed[key(item)] = value ? value(item) : item
  }

  return indexed
}

/**
 * Counts how many items fall under each key returned from `key`.
 * @param items - The array to count.
 * @param key - Maps an item to its key.
 * @returns An object mapping each key to its occurrence count.
 */
export function countBy<T, K extends PropertyKey>(
  items: readonly T[],
  key: (item: T) => K,
): Record<K, number> {
  const counts = {} as Record<K, number>

  for (const item of items) {
    const itemKey = key(item)
    counts[itemKey] = (counts[itemKey] ?? 0) + 1
  }

  return counts
}

/**
 * Removes falsy values (`null`, `undefined`, `false`, `0`, `""`, `NaN`) from an
 * array, narrowing the result type to exclude them.
 * @param items - The array to compact.
 * @returns A new array without falsy values.
 */
export function compact<T>(items: readonly (T | null | undefined | false)[]): T[] {
  return items.filter(isTruthy)
}

/** A value {@link sortBy} can compare. */
export type SortValue = number | string | Date

/** A sort key with its own direction, for {@link sortBy}. */
export interface SortKey<T> {
  /** Maps an item to the value to sort by. */
  key: (item: T) => SortValue
  /** The direction for this key. Defaults to the `order` option. */
  order?: "asc" | "desc"
}

/** Options for {@link sortBy}. */
export interface SortByOptions {
  /** The direction for keys without their own `order`. Defaults to "asc". */
  order?: "asc" | "desc"
  /**
   * How strings are compared. "locale" (default) uses `localeCompare`, for text shown to people.
   * "binary" compares UTF-16 code units like a bare `.sort()`, for tokens and stable cache keys.
   */
  compare?: "locale" | "binary"
}

/**
 * Compares two sort values in ascending order, using `localeCompare` for strings in "locale" mode.
 */
function compareValues(a: SortValue, b: SortValue, compare: SortByOptions["compare"]) {
  if (compare === "locale" && typeof a === "string" && typeof b === "string") {
    return a.localeCompare(b)
  }

  return a < b ? -1 : a > b ? 1 : 0
}

/**
 * Returns a new array sorted by one or more keys. Each key is a function or a
 * `{ key, order }` object, and later keys break ties left by earlier ones.
 * Numbers and dates compare naturally; strings follow the `compare` option.
 * The sort is stable and does not mutate the input.
 * @param items - The array to sort.
 * @param keys - A key or an array of keys, applied in turn.
 * @param options - The default direction and the string comparison.
 * @returns A new sorted array.
 * @example
 * sortBy(posts, post => post.publishedAt, { order: "desc" })
 * sortBy(users, [{ key: user => user.score, order: "desc" }, user => user.name])
 * sortBy(tokens, token => token, { compare: "binary" })
 */
export function sortBy<T>(
  items: readonly T[],
  keys: ((item: T) => SortValue) | SortKey<T> | readonly (((item: T) => SortValue) | SortKey<T>)[],
  { order = "asc", compare = "locale" }: SortByOptions = {},
): T[] {
  const sortKeys = (Array.isArray(keys) ? keys : [keys]).map(sortKey =>
    typeof sortKey === "function"
      ? { key: sortKey, direction: order === "asc" ? 1 : -1 }
      : { key: sortKey.key, direction: (sortKey.order ?? order) === "asc" ? 1 : -1 },
  )

  // Compute every key once per item, not once per comparison
  const entries = items.map(item => ({ item, values: sortKeys.map(({ key }) => key(item)) }))

  entries.sort((a, b) => {
    for (const [index, { direction }] of sortKeys.entries()) {
      const result = compareValues(a.values[index]!, b.values[index]!, compare)
      if (result !== 0) return result * direction
    }

    return 0
  })

  return entries.map(({ item }) => item)
}

/**
 * Sums an array of numbers.
 * @param items - The numbers to sum.
 * @returns The total.
 */
export function sum(items: readonly number[]): number {
  return items.reduce((total, item) => total + item, 0)
}

/**
 * Sums an array by the number returned from `key`.
 * @param items - The array to sum.
 * @param key - Maps an item to the number to add.
 * @returns The total.
 */
export function sumBy<T>(items: readonly T[], key: (item: T) => number): number {
  return items.reduce((total, item) => total + key(item), 0)
}
