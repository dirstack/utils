/**
 * Utility functions for working with objects.
 */

import type { ReplaceNullWithUndefined } from "../index.js"

/**
 * Checks if a plain object is empty (has no own enumerable properties).
 * @param value - The object to check.
 * @returns `true` if the object is a plain object with no properties, `false` otherwise.
 */
export function isEmptyObject(value: Record<string, unknown> = {}) {
  const prototype = Object.getPrototypeOf(value)
  return (prototype === Object.prototype || prototype === null) && !Object.keys(value).length
}

/**
 * Checks if a key is present in an object.
 * @param key - The key to check.
 * @param target - The object to check.
 * @returns `true` if the key is present in the object, `false` otherwise.
 */
export function isKeyInObject<T extends object>(key: PropertyKey, target: T): key is keyof T {
  return key in target
}

/**
 * Creates a comparator that orders objects by the position of their first key in `keys`.
 * Objects whose first key is not in `keys` sort last.
 * @param keys - The keys in their desired order.
 * @returns A comparator for `Array.prototype.sort`.
 */
export function sortObjectKeys(keys: string[]) {
  return (a: Record<string, unknown>, b: Record<string, unknown>) => {
    const aIndex = keys.indexOf(Object.keys(a)[0] ?? "")
    const bIndex = keys.indexOf(Object.keys(b)[0] ?? "")

    if (aIndex === -1 && bIndex === -1) return 0
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1

    return aIndex - bIndex
  }
}

/**
 * Returns a new object with the keys sorted, by default in UTF-16 code unit order.
 * @param source - The object to sort.
 * @param comparator - An optional comparator function to use when sorting the keys.
 * @returns A new object with the sorted keys.
 */
export function sortObject<T extends Record<K, unknown>, K extends keyof T>(
  source: T,
  comparator?: (a: unknown, b: unknown) => number,
) {
  const sortedKeys = Object.keys(source).sort(comparator) as K[]
  return Object.fromEntries(sortedKeys.map(key => [key, source[key]])) as T
}

/**
 * Creates a new object with only the specified properties from the source object.
 * @param source - The source object to pick properties from.
 * @param keys - The property keys to pick. Keys missing from the source are skipped.
 * @returns A new object containing only the specified properties.
 *
 * @example
 * const user = { id: 1, name: 'John', email: 'john@example.com', password: 'secret' }
 * const publicUser = pick(user, ['id', 'name', 'email'])
 * // Result: { id: 1, name: 'John', email: 'john@example.com' }
 */
export function pick<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>

  for (const key of keys) {
    if (key in source) result[key] = source[key]
  }

  return result
}

/**
 * @deprecated Use {@link pick} instead.
 */
export const pickFromObject = pick

/**
 * Creates a new object with the specified properties removed from the source
 * object. The complement of {@link pick}.
 * @param source - The source object to omit properties from.
 * @param keys - The property keys to remove.
 * @returns A new object without the specified properties.
 *
 * @example
 * const user = { id: 1, name: 'John', password: 'secret' }
 * const publicUser = omit(user, ['password'])
 * // Result: { id: 1, name: 'John' }
 */
export function omit<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): Omit<T, K> {
  const result = { ...source }

  for (const key of keys) {
    delete result[key]
  }

  return result
}

/**
 * Recursively converts all null values in an object or array to undefined.
 * Returns a new object or array; the input is not mutated. Non-plain objects
 * (e.g. `Date`) are returned as-is.
 * @param value - The value to convert.
 * @returns The converted value.
 */
export function nullsToUndefined<T>(value: T): ReplaceNullWithUndefined<T> {
  if (value === null) return undefined as ReplaceNullWithUndefined<T>

  if (Array.isArray(value)) {
    return value.map(item => nullsToUndefined(item)) as ReplaceNullWithUndefined<T>
  }

  // Only plain objects are walked; class instances such as Date are returned unchanged.
  if ((value as { constructor?: { name?: string } })?.constructor?.name === "Object") {
    const source = value as Record<string, unknown>
    const result: Record<string, unknown> = {}

    for (const key of Object.keys(source)) {
      result[key] = nullsToUndefined(source[key])
    }

    return result as ReplaceNullWithUndefined<T>
  }

  return value as ReplaceNullWithUndefined<T>
}
