/**
 * Utility functions for working with numbers.
 */

/**
 * Keep a number within a specified range.
 * @param value - The number to keep within the range.
 * @param min - The minimum value of the range.
 * @param max - The maximum value of the range.
 * @returns The number within the specified range.
 */
export const keepNumberInRange = (value: number, min?: number, max?: number) => {
  if (min !== undefined && max !== undefined) {
    return Math.min(Math.max(value, min), max)
  }
  if (min !== undefined) {
    return Math.max(value, min)
  }
  if (max !== undefined) {
    return Math.min(value, max)
  }

  return value
}

/**
 * Parse a string into a numeric value.
 * @param string - The string to parse.
 * @returns The parsed numeric value, or the original string if it cannot be parsed.
 */
export const parseNumericValue = (string: string) => {
  const number = Number.parseFloat(string)

  return Number.isNaN(number) ? string : number
}
