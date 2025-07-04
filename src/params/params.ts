/**
 * Utility functions for handling request parameters.
 */

/**
 * Represents the parameters for a paginated query.
 * @template T - The type of the query parameters.
 */
export type GetPageParams<T> = T & {
  take: number
  skip: number
}

/**
 * Returns an object containing the search parameters from a request URL.
 * @param url - The request url.
 * @returns An object containing the search parameters.
 */
export const getSearchParams = (url: string) => {
  return Object.fromEntries(new URL(url).searchParams)
}

/**
 * Updates a search string with the specified parameters.
 *
 * @param queryString The original query string to be updated.
 * @param params An object containing key-value pairs to be set as search parameters.
 * @returns The updated query string with the new search parameters.
 */
const updateSearchParams = (queryString: string, params: { [key: string]: string }): string => {
  // Create a URLSearchParams object from the query string
  const searchParams = new URLSearchParams(queryString)

  // Add/remove search parameters based on the provided value
  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      searchParams.delete(key)
    } else {
      searchParams.set(key, value)
    }
  }

  // Return the updated search string
  return searchParams.toString()
}

/**
 * Updates the URL with the specified search parameters.
 *
 * @param url The original URL to be updated.
 * @param params An object containing key-value pairs to be set as search parameters.
 * @returns The updated URL with the new search parameters.
 */
export const addSearchParams = (url: string, params: { [key: string]: string }): string => {
  // If the URL is not a full URL, return it as is
  if (!url.startsWith("http")) return url

  // Create a URL object
  const urlObj = new URL(url)

  // Extract the search string, update it with new parameters, and get the updated search string
  const updatedSearchString = updateSearchParams(urlObj.search, params)

  // Set the search parameters for the URL
  urlObj.search = updatedSearchString

  // Return the resulting URL with the updated search parameters
  return urlObj.toString()
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
  const { page, ...params } = getSearchParams(url)

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
  searchParams.set("page", page.toString())

  return `${pathname}?${searchParams.toString()}`
}
