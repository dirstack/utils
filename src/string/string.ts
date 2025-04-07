/**
 * Utility functions for working with strings.
 */

/**
 * Uppercases the first character in the `string`.
 * @param string - The string to uppercase the first character of.
 * @returns The string with the first character in uppercase.
 */
export const ucFirst = (string: string) => {
  if (typeof string !== "string") {
    return ""
  }

  if (string.length === 0) {
    return string
  }

  return string[0]?.toUpperCase() + string.slice(1)
}

/**
 * Lowercases the first character in the `string`.
 * @param string - The string to lowercase the first character of.
 * @returns The string with the first character in lowercase.
 */
export const lcFirst = (string: string) => {
  if (typeof string !== "string") {
    return ""
  }

  if (string.length === 0) {
    return string
  }

  return string[0]?.toLowerCase() + string.slice(1)
}
