/**
 * Utility functions for user interface logic: layout, navigation and display.
 */

/**
 * Picks the column count within [min, max] that leaves the last grid row as
 * full as possible. Exact division wins (12 items with 5–6 columns gives 6;
 * 10 items gives 5), otherwise the count with the fewest empty slots. Ties go
 * to more columns.
 * @param count - The number of items to lay out.
 * @param min - The minimum number of columns per row.
 * @param max - The maximum number of columns per row.
 * @returns The column count that best balances the rows.
 */
export function getBalancedColumns(count: number, min: number, max: number): number {
  let best = min

  for (let columns = min; columns <= max; columns++) {
    const emptySlots = (columns - (count % columns)) % columns
    const bestEmptySlots = (best - (count % best)) % best

    if (emptySlots <= bestEmptySlots) best = columns
  }

  return best
}

/**
 * Returns a display label for a keyboard shortcut, such as "⌘K".
 * @param shortcut - The shortcut key, and whether it needs the meta key.
 * @returns The label for the shortcut.
 */
export function getShortcutLabel({ key, metaKey }: { key: string; metaKey?: boolean }) {
  return `${metaKey ? "⌘" : ""}${key.toUpperCase()}`
}

/**
 * Checks if a hexadecimal color is light.
 * Only supports 6-digit hex colors (RGB). Longer strings are cut to 6 digits.
 * @param color - The hexadecimal color code to check (e.g. "#FF0000").
 * @returns A boolean indicating if the color is light.
 */
export function isLightColor(color: string): boolean {
  const hex = color.replace("#", "").substring(0, 6)

  const red = Number.parseInt(hex.substring(0, 2), 16)
  const green = Number.parseInt(hex.substring(2, 4), 16)
  const blue = Number.parseInt(hex.substring(4, 6), 16)

  // Perceived brightness, weighted by how sensitive the eye is to each channel (ITU-R BT.601).
  const brightness = red * 0.299 + green * 0.587 + blue * 0.114

  return brightness > 186
}

/**
 * Returns the current page number from a string.
 * @param page - The page number as a string.
 * @returns The current page number as a number.
 */
export function getCurrentPage(page?: string | null): number {
  if (!page || Number.isNaN(Number(page))) return 1

  // Strings such as "  " or ".5" pass the check above but parse to NaN.
  return Math.max(Number.parseInt(page, 10) || 1, 1)
}

/**
 * Gets the offset and limit of a 1-based page, in the shape Prisma's `findMany` takes.
 * Pages below 1 count as page 1, and fractional pages are rounded down.
 * @param pagination - The page number and the number of items per page.
 * @returns The number of items to skip and to take.
 * @example
 * getPagination({ page: 3, perPage: 20 }) // { skip: 40, take: 20 }
 */
export function getPagination({ page, perPage }: { page: number; perPage: number }): {
  skip: number
  take: number
} {
  return { skip: (Math.max(Math.floor(page), 1) - 1) * perPage, take: perPage }
}

/**
 * Returns a link to a specific page of a paginated query.
 * @param searchParams - The current search parameters. They are copied, not modified.
 * @param pathname - The pathname of the URL.
 * @param page - The page number to link to. Page 1 links without a `page` parameter.
 * @returns A link to the specified page of the paginated query.
 */
export function getPageLink(searchParams: URLSearchParams, pathname: string, page: number): string {
  const params = new URLSearchParams(searchParams)

  if (page > 1) {
    params.set("page", page.toString())
  } else {
    params.delete("page")
  }

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
