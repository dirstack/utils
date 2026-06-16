import { isTruthy } from "../helpers/helpers"

/**
 * A collection of array utilities.
 */

/**
 * Removes duplicate items, keyed by the value returned from `key`. The first
 * item seen for each key wins, so ordering is preserved and earlier items take
 * precedence over later duplicates.
 * @param items - The array to deduplicate.
 * @param key - Maps an item to the value identifying its uniqueness.
 * @returns A new array with duplicates removed.
 */
export const uniqBy = <T, K>(items: T[], key: (item: T) => K): T[] => {
  const seen = new Set<K>()

  return items.filter(item => {
    const k = key(item)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/**
 * Removes duplicate primitive items using strict equality. First occurrence wins.
 * @param items - The array to deduplicate.
 * @returns A new array with duplicates removed.
 */
export const uniq = <T>(items: T[]): T[] => {
  return [...new Set(items)]
}

/**
 * Splits an array into chunks of a specified size. The final chunk holds the
 * remainder when the length isn't an exact multiple of `size`.
 * @param items - The array to split.
 * @param size - The maximum size of each chunk.
 * @returns An array of chunks.
 */
export const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }

  return chunks
}

/**
 * @deprecated Use {@link chunk} instead.
 */
export const splitArrayIntoChunks = chunk

/**
 * Groups items into an object of arrays, keyed by the value returned from `key`.
 * @param items - The array to group.
 * @param key - Maps an item to its group key.
 * @returns An object mapping each key to the items that produced it.
 */
export const groupBy = <T, K extends PropertyKey>(
  items: T[],
  key: (item: T) => K,
): Record<K, T[]> => {
  return items.reduce(
    (acc, item) => {
      const k = key(item)
      ;(acc[k] ??= []).push(item)
      return acc
    },
    {} as Record<K, T[]>,
  )
}

/**
 * Indexes items into an object keyed by the value returned from `key`. When
 * multiple items share a key, the last one wins.
 * @param items - The array to index.
 * @param key - Maps an item to its key.
 * @returns An object mapping each key to a single item.
 */
export const keyBy = <T, K extends PropertyKey>(items: T[], key: (item: T) => K): Record<K, T> => {
  return items.reduce(
    (acc, item) => {
      acc[key(item)] = item
      return acc
    },
    {} as Record<K, T>,
  )
}

/**
 * Counts how many items fall under each key returned from `key`.
 * @param items - The array to count.
 * @param key - Maps an item to its key.
 * @returns An object mapping each key to its occurrence count.
 */
export const countBy = <T, K extends PropertyKey>(
  items: T[],
  key: (item: T) => K,
): Record<K, number> => {
  return items.reduce(
    (acc, item) => {
      const k = key(item)
      acc[k] = (acc[k] ?? 0) + 1
      return acc
    },
    {} as Record<K, number>,
  )
}

/**
 * Removes falsy values (`null`, `undefined`, `false`, `0`, `""`, `NaN`) from an
 * array, narrowing the result type to exclude them.
 * @param items - The array to compact.
 * @returns A new array without falsy values.
 */
export const compact = <T>(items: (T | null | undefined | false)[]): T[] => {
  return items.filter(isTruthy)
}

/**
 * Returns a new array sorted by the value returned from `key`. Strings are
 * compared with `localeCompare`; numbers and dates compare naturally. Does not
 * mutate the input.
 * @param items - The array to sort.
 * @param key - Maps an item to the value to sort by.
 * @param order - Sort direction, ascending by default.
 * @returns A new sorted array.
 */
export const sortBy = <T>(
  items: T[],
  key: (item: T) => number | string | Date,
  order: "asc" | "desc" = "asc",
): T[] => {
  const dir = order === "asc" ? 1 : -1

  return [...items].sort((a, b) => {
    const ka = key(a)
    const kb = key(b)
    if (typeof ka === "string" && typeof kb === "string") return ka.localeCompare(kb) * dir
    return (ka < kb ? -1 : ka > kb ? 1 : 0) * dir
  })
}

/**
 * Sums an array of numbers.
 * @param items - The numbers to sum.
 * @returns The total.
 */
export const sum = (items: number[]): number => {
  return items.reduce((acc, item) => acc + item, 0)
}

/**
 * Sums an array by the number returned from `key`.
 * @param items - The array to sum.
 * @param key - Maps an item to the number to add.
 * @returns The total.
 */
export const sumBy = <T>(items: T[], key: (item: T) => number): number => {
  return items.reduce((acc, item) => acc + key(item), 0)
}
