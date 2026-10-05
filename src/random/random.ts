/**
 * Utility functions for generating random values.
 */

/**
 * Returns a random hexadecimal color code.
 * @returns A string representing a random hexadecimal color code.
 */
export function getRandomColor(): string {
  return Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")
}

/**
 * Returns a random string of letters and digits.
 *
 * Uses `Math.random()`, so it is not cryptographically secure. Do not use it
 * for passwords, tokens, or anything security-sensitive; use
 * `crypto.getRandomValues` for those.
 * @param length - The desired length of the random string. Defaults to 16.
 * @returns A random string of letters and digits.
 */
export function getRandomString(length = 16): string {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

  return Array.from(
    { length },
    () => characters[Math.floor(Math.random() * characters.length)],
  ).join("")
}

/**
 * Generates a random integer between the specified minimum and maximum values (inclusive).
 * @param min - The minimum value for the random number.
 * @param max - The maximum value for the random number.
 * @returns A random integer between the specified minimum and maximum values.
 */
export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generates a random string of digits.
 *
 * Uses `Math.random()`, so it is not cryptographically secure. Do not use it
 * for one-time passwords, tokens, or anything security-sensitive; use
 * `crypto.getRandomValues` for those.
 * @param length - The number of digits.
 * @returns A random string of digits.
 */
export function getRandomDigits(length: number) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("")
}

/**
 * Returns a random element from an array, or `undefined` if the array is empty.
 * @param array - The array to get a random element from.
 * @returns A random element from the array, or `undefined` if it is empty.
 */
export function getRandomElement<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Returns a random property value from an object, or `undefined` if the object
 * has no own enumerable properties.
 * @param source - The object to get a random property value from.
 * @returns A random property value, or `undefined` if the object is empty.
 */
export function getRandomProperty<T>(source: Record<string, T>): T | undefined {
  const keys = Object.keys(source)
  const randomKey = keys[Math.floor(Math.random() * keys.length)]

  return randomKey === undefined ? undefined : source[randomKey]
}
