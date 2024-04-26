import { type ColorResult, type HsvaColor, color, hexToRgba } from "@uiw/color-convert"

/**
 * Check if a given color in hexadecimal format is a light color.
 *
 * @param hexa - The hexadecimal color code to check.
 * @returns A boolean indicating if the color is light.
 */
export const isLightColor = (hexa: string): boolean => {
  const { r, g, b, a } = hexToRgba(hexa)
  const brightness = r * 0.299 + g * 0.587 + b * 0.114 + (1 - a) * 255

  return brightness > 186
}

/**
 * Returns a ColorResult object based on the provided string or HsvaColor.
 * @param str - The string or HsvaColor to convert into a ColorResult object.
 * @returns The ColorResult object.
 */
export const getColorObject = (str: string | HsvaColor): ColorResult => {
  return color(str)
}
