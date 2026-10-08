/**
 * URL helpers shared by the http module. Not exported from the package root.
 */

/** An http or https protocol at the start of a URL, in any letter case. */
export const HTTP_PROTOCOL: RegExp = /^https?:\/\//i

/**
 * Removes every trailing slash, keeping a lone root slash.
 * A loop rather than `/\/+$/`, which backtracks in quadratic time on long runs of slashes.
 */
function removeTrailingSlash(value: string) {
  let end = value.length
  while (end > 1 && value[end - 1] === "/") end--
  return value.slice(0, end)
}

/**
 * Removes every leading and trailing slash, in linear time.
 * @param value - The path segment to trim.
 * @returns The segment without slashes at either end.
 */
export function trimSlashes(value: string): string {
  let start = 0
  let end = value.length
  while (start < end && value[start] === "/") start++
  while (end > start && value[end - 1] === "/") end--
  return value.slice(start, end)
}

/**
 * Normalizes a URL by trimming it and removing the trailing slashes from its path.
 * @param url - The URL to normalize.
 * @returns The normalized URL.
 */
export function normalizeUrl(url?: string): string {
  if (!url) return ""

  const normalized = url.trim()

  // With a query or hash, the trailing slash sits before it, so only the path is trimmed.
  if (normalized.includes("?") || normalized.includes("#")) {
    try {
      const parsedUrl = new URL(normalized)
      parsedUrl.pathname = removeTrailingSlash(parsedUrl.pathname)
      return parsedUrl.toString()
    } catch {}
  }

  return removeTrailingSlash(normalized)
}

/**
 * Checks if a URL is a localhost URL.
 * @param url - The URL to check.
 * @returns True if the URL points to localhost.
 */
export function isLocalhostUrl(url?: string): boolean {
  if (!url) return false

  try {
    const absolute = HTTP_PROTOCOL.test(url)
      ? url
      : `http:${url.startsWith("//") ? "" : "//"}${url}`
    const { hostname } = new URL(absolute)

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.endsWith(".localhost")
    )
  } catch {
    return url.includes("localhost") || url.includes("127.0.0.1")
  }
}
