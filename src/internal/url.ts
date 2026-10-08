/**
 * URL helpers shared by the http module. Not exported from the package root.
 */

/**
 * Removes every trailing slash, keeping a lone root slash.
 */
function removeTrailingSlash(value: string) {
  return value.replace(/(?<=.)\/+$/, "")
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
    const { hostname } = new URL(/^https?:\/\//.test(url) ? url : `http://${url}`)
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost")
  } catch {
    return url.includes("localhost") || url.includes("127.0.0.1")
  }
}
