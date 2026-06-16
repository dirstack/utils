import type { ReplaceNullWithUndefined } from ".."

/**
 * Utility functions for working with objects.
 */

/**
 * Checks if an object is empty (has no own properties).
 * @param obj - The object to check.
 * @returns `true` if the object is empty, `false` otherwise.
 */
export const isEmptyObject = (obj: Record<string, unknown> = {}) => {
  const proto = Object.getPrototypeOf(obj)
  return (proto === Object.prototype || proto === null) && !Object.keys(obj).length
}

/**
 * Checks if a key is present in an object.
 * @param key - The key to check.
 * @param obj - The object to check.
 * @returns `true` if the key is present in the object, `false` otherwise.
 */
export const isKeyInObject = <T extends object>(key: PropertyKey, obj: T): key is keyof T => {
  return key in obj
}

/**
 * Sorts two objects based on their keys' positions in an array of keys.
 * @param keys - An array of keys to sort the objects by.
 * @param a - The first object to compare.
 * @param b - The second object to compare.
 * @returns A number indicating the sort order of the two objects.
 */
export const sortObjectKeys = (keys: string[]) => {
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
 * Sorts the keys of an object in alphabetical order and returns a new object with the sorted keys.
 * @param obj - The input object to sort.
 * @param comparator - An optional comparator function to use when sorting the keys.
 * @returns - A new object with the sorted keys.
 */
export const sortObject = <T extends Record<K, unknown>, K extends keyof T>(
  obj: T,
  comparator?: (a: unknown, b: unknown) => number,
) => {
  return Object.keys(obj)
    .sort(comparator)
    .reduce((result, key) => {
      return { ...result, [key as K]: obj[key as K] }
    }, {} as T)
}

/**
 * Creates a new object with only the specified properties from the source object.
 * Provides full type safety and intellisense for the picked properties.
 *
 * @param obj - The source object to pick properties from
 * @param keys - Array of property keys to pick from the source object
 * @returns A new object containing only the specified properties
 *
 * @example
 * const user = { id: 1, name: 'John', email: 'john@example.com', password: 'secret' }
 * const publicUser = pick(user, ['id', 'name', 'email'])
 * // Result: { id: 1, name: 'John', email: 'john@example.com' }
 */
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
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
 *
 * @param obj - The source object to omit properties from
 * @param keys - Array of property keys to remove from the source object
 * @returns A new object without the specified properties
 *
 * @example
 * const user = { id: 1, name: 'John', password: 'secret' }
 * const publicUser = omit(user, ['password'])
 * // Result: { id: 1, name: 'John' }
 */
export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Omit<T, K> => {
  const result = { ...obj }
  for (const key of keys) {
    delete result[key]
  }
  return result
}

/**
 * Recursively converts all null values in an object or array to undefined.
 * Returns a new object/array; the input is not mutated. Non-plain objects
 * (e.g. `Date`) are returned as-is.
 * @param obj - The object to convert.
 * @returns The converted object.
 */
export const nullsToUndefined = <T>(obj: T): ReplaceNullWithUndefined<T> => {
  if (obj === null) {
    return undefined as any
  }

  if (Array.isArray(obj)) {
    return obj.map(item => nullsToUndefined(item)) as any
  }

  // object check based on: https://stackoverflow.com/a/51458052/6489012
  if ((obj as { constructor?: { name?: string } })?.constructor?.name === "Object") {
    const source = obj as Record<string, unknown>
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(source)) {
      result[key] = nullsToUndefined(source[key])
    }
    return result as any
  }

  return obj as any
}
