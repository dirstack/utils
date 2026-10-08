/**
 * Utility functions for generating random values.
 */

const DIGITS = "0123456789"
const LETTERS_AND_DIGITS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// `crypto.getRandomValues` fills at most 65,536 bytes per call
const MAX_RANDOM_BYTES = 65_536

/**
 * Picks `length` characters from `alphabet` with a cryptographically secure source.
 * Bytes at or above the largest multiple of the alphabet size are discarded, because
 * `byte % size` would otherwise favor the first characters.
 * @param alphabet - The characters to pick from, at most 256.
 * @param length - The number of characters.
 * @returns The random characters.
 */
function getRandomCharacters(alphabet: string, length: number) {
  const target = Math.floor(length)
  const limit = 256 - (256 % alphabet.length)
  let result = ""

  while (result.length < target) {
    // A few percent of bytes are rejected, so ask for some spare ones
    const size = Math.min(MAX_RANDOM_BYTES, Math.ceil((target - result.length) * 1.1) + 8)

    for (const byte of crypto.getRandomValues(new Uint8Array(size))) {
      if (byte >= limit) continue
      result += alphabet[byte % alphabet.length]
      if (result.length === target) break
    }
  }

  return result
}

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
 * Uses `crypto.getRandomValues` with rejection sampling, so every character is equally
 * likely and the output is suitable for tokens.
 * @param length - The desired length of the random string. Defaults to 16.
 * @returns A random string of letters and digits.
 */
export function getRandomString(length = 16): string {
  return getRandomCharacters(LETTERS_AND_DIGITS, length)
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
 * Uses `crypto.getRandomValues` with rejection sampling, so every digit is equally
 * likely and the output is suitable for tokens and one-time codes.
 * @param length - The number of digits.
 * @returns A random string of digits.
 */
export function getRandomDigits(length: number) {
  return getRandomCharacters(DIGITS, length)
}

/**
 * Returns a random element from an array, or `undefined` if the array is empty.
 * @param array - The array to get a random element from.
 * @returns A random element from the array, or `undefined` if it is empty.
 */
export function getRandomElement<T>(array: readonly T[]): T | undefined {
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
