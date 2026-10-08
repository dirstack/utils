/**
 * Utility functions for working with objects.
 */

/**
 * Checks if a value is a plain object with no own enumerable properties.
 * `null`, `undefined`, arrays, class instances and other non-plain values return false.
 * @param value - The value to check.
 * @returns `true` if the value is a plain object with no properties, `false` otherwise.
 */
export function isEmptyObject(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false

  const prototype = Object.getPrototypeOf(value)
  return (prototype === Object.prototype || prototype === null) && !Object.keys(value).length
}

/**
 * Checks if a key is an own property of an object, and narrows the key's type when it is.
 * Inherited keys such as "toString" or "constructor" do not count.
 * @param key - The key to check.
 * @param target - The object to check.
 * @returns `true` if the object has the key as its own property, `false` otherwise.
 */
export function isKeyInObject<T extends object>(key: PropertyKey, target: T): key is keyof T {
  return Object.hasOwn(target, key)
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
