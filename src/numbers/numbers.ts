/**
 * Utility functions for working with numbers.
 */

/**
 * Clamp a number within a specified range. The lower and upper bounds are both
 * optional.
 * @param value - The number to clamp.
 * @param min - The minimum value of the range.
 * @param max - The maximum value of the range.
 * @returns The number constrained to the specified range.
 */
export const clamp = (value: number, min?: number, max?: number) => {
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
 * @deprecated Use {@link clamp} instead.
 */
export const keepNumberInRange = clamp

/**
 * Parse a string into a numeric value.
 * @param value - The value to parse into a numeric value.
 * @returns The parsed numeric value, or `undefined` if the value cannot be parsed.
 */
export const parseNumericValue = (value?: string | number | null) => {
  if (value === undefined || value === null) return undefined
  const parsed = Number.parseFloat(value.toString())

  return Number.isNaN(parsed) ? undefined : parsed
}

/**
 * Rounds a number to a specified number of decimal places, with an adjustment for floating point precision.
 * @param value - The number to round.
 * @param decimals - The number of decimal places to round to. Defaults to 2.
 * @returns The rounded number.
 */
export const preciseRound = (value: number, decimals = 2) => {
  const factor = 10 ** decimals

  return Math.round((value + Number.EPSILON) * factor) / factor
}
