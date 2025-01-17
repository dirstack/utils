/**
 * Check if a given color in hexadecimal format is a light color.
 * Only supports 6-digit hex colors (RGB). If longer string is provided, it will be trimmed.
 *
 * @param hexa - The hexadecimal color code to check (e.g. "#FF0000").
 * @returns A boolean indicating if the color is light.
 */
export const isLightColor = (hexa: string): boolean => {
  // Remove # if present and trim to 6 characters
  const hex = hexa.replace("#", "").substring(0, 6)

  // Parse RGB values
  const r = Number.parseInt(hex.substring(0, 2), 16)
  const g = Number.parseInt(hex.substring(2, 4), 16)
  const b = Number.parseInt(hex.substring(4, 6), 16)

  // Calculate perceived brightness
  const brightness = r * 0.299 + g * 0.587 + b * 0.114

  return brightness > 186
}
