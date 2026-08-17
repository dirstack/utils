/**
 * Utility functions for user interface logic: layout, navigation and display.
 */

import { getQueryParams } from "../http/http"

/**
 * Returns a label for the first search key shortcut found.
 * @returns The label for the shortcut.
 */
export const getShortcutLabel = ({ key, metaKey }: { key: string; metaKey?: boolean }) => {
  const label = `${metaKey ? "⌘" : ""}${key.toUpperCase()}`
  return label
}

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

/**
 * Represents the parameters for a paginated query.
 * @template T - The type of the query parameters.
 */
export type GetPageParams<T> = T & {
  take: number
  skip: number
}

/**
 * Returns the current page number from a string.
 * @param page - The page number as a string.
 * @returns The current page number as a number.
 */
export const getCurrentPage = (page?: string | null) => {
  return Math.max(page && !Number.isNaN(Number(page)) ? Number.parseInt(page || "1", 10) : 1, 1)
}

/**
 * Returns an object containing the parameters for a paginated query.
 * @template T - The type of the query parameters.
 * @param url - The URL to get the page parameters from.
 * @param take - The number of items to take per page.
 * @returns An object containing the parameters for a paginated query.
 */
export const getPageParams = <T extends object>(url: string, take: number) => {
  const { page, ...params } = getQueryParams(url)

  const currentPage = getCurrentPage(page)
  const skip = (currentPage - 1) * take

  return { take, skip, ...params } as GetPageParams<T>
}

/**
 * Returns a link to a specific page of a paginated query.
 * @param searchParams - The search parameters object.
 * @param pathname - The pathname of the URL.
 * @param page - The page number to link to.
 * @returns A link to the specified page of the paginated query.
 */
export const getPageLink = (searchParams: URLSearchParams, pathname: string, page: number) => {
  if (page > 1) {
    searchParams.set("page", page.toString())
  } else {
    searchParams.delete("page")
  }

  const query = searchParams.toString()
  return query ? `${pathname}?${query}` : pathname
}
