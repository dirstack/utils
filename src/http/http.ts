/**
 * Utility functions for URL manipulation and validation.
 */

/**
 * Checks if a URL is a valid http(s) URL using the URL constructor.
 * @param url - The URL to validate.
 * @returns True if the URL is valid.
 */
export function isValidUrl(url?: string): boolean {
  if (!url || typeof url !== "string") return false

  try {
    const { protocol } = new URL(url)
    return protocol === "http:" || protocol === "https:"
  } catch {
    return false
  }
}

/**
 * Adds a protocol to a URL string that has none.
 * @param url - The URL string without protocol.
 * @param secure - Whether to use https. Defaults to true, or false for localhost URLs.
 * @returns The URL with a protocol.
 */
export function addProtocol(url?: string, secure?: boolean): string {
  if (!url) return ""
  if (isExternalUrl(url)) return url

  const protocol = (secure ?? !isLocalhostUrl(url)) ? "https" : "http"

  return `${protocol}://${url}`
}

/**
 * Removes the http(s) protocol from a URL string.
 * @param url - The URL string with protocol.
 * @returns The URL without protocol.
 */
export function removeProtocol(url?: string): string {
  return url?.replace(/^https?:\/\//, "") ?? ""
}

/**
 * Removes one trailing slash, keeping a lone root slash.
 */
function removeTrailingSlash(value: string) {
  return value.length > 1 && value.endsWith("/") ? value.slice(0, -1) : value
}

/**
 * Normalizes a URL by trimming it and removing the trailing slash from its path.
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
 * Gets the base URL: protocol, hostname and port.
 * @param url - The URL string.
 * @returns The base URL without path, search, or hash, or the input if it cannot be parsed.
 */
export function getBaseUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    return `${parsedUrl.protocol}//${parsedUrl.host}`
  } catch {
    return url
  }
}

/**
 * Extracts the domain name from a URL.
 * @param url - The URL string.
 * @returns The domain name without www prefix, or the input if it is not a valid URL.
 */
export function getDomain(url: string): string {
  if (!isValidUrl(url)) return url

  const { hostname } = new URL(url)
  return hostname.startsWith("www.") ? hostname.slice(4) : hostname
}

/**
 * Checks if a URL is external, meaning it starts with an http(s) protocol.
 * @param url - The URL to check.
 * @returns True if the URL is external.
 */
export function isExternalUrl(url?: string): boolean {
  if (!url) return false
  return /^https?:\/\//.test(url)
}

/**
 * Checks if a URL is a localhost URL.
 * @param url - The URL to check.
 * @returns True if the URL points to localhost.
 */
export function isLocalhostUrl(url?: string): boolean {
  if (!url) return false

  try {
    // An explicit protocol keeps addProtocol from calling back into this function.
    const { hostname } = new URL(addProtocol(url, false))
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost")
  } catch {
    return url.includes("localhost") || url.includes("127.0.0.1")
  }
}

/**
 * Joins URL path segments with single slashes.
 * @param base - The base URL.
 * @param paths - The path segments to join. Leading and trailing slashes are removed.
 * @returns The combined URL.
 */
export function joinUrlPaths(base: string, ...paths: string[]): string {
  if (!base) return ""

  let result = normalizeUrl(base)

  for (const path of paths) {
    if (!path) continue

    const trimmedPath = path.replace(/^\/+|\/+$/g, "")
    if (trimmedPath) result += `/${trimmedPath}`
  }

  return result
}

/**
 * Extracts query parameters from a URL. When a key repeats, the last value wins.
 * @param url - The URL string.
 * @returns An object containing the query parameters.
 */
export function getQueryParams(url: string): Record<string, string> {
  try {
    return Object.fromEntries(new URL(url).searchParams)
  } catch {
    return {}
  }
}

/**
 * Adds or updates query parameters in a URL.
 * @param url - The base URL.
 * @param params - The parameters to add or update.
 * @returns The URL with updated parameters, or the input if it cannot be parsed.
 */
export function setQueryParams(
  url: string,
  params: Record<string, string | number | boolean>,
): string {
  try {
    const parsedUrl = new URL(url)

    for (const [key, value] of Object.entries(params)) {
      parsedUrl.searchParams.set(key, String(value))
    }

    // Drop the slash before the query, so "example.com/?page=2" becomes "example.com?page=2".
    return parsedUrl.toString().replace(/\/\?/, "?")
  } catch {
    return url
  }
}

/**
 * Removes query parameters from a URL.
 * @param url - The URL string.
 * @returns The URL without query parameters.
 */
export function removeQueryParams(url?: string): string {
  if (!url) return ""

  try {
    const parsedUrl = new URL(url)
    parsedUrl.search = ""
    return normalizeUrl(parsedUrl.toString())
  } catch {
    const questionIndex = url.indexOf("?")
    return questionIndex !== -1 ? url.substring(0, questionIndex) : url
  }
}

/**
 * Options for {@link checkUrlAvailability}.
 */
export interface CheckUrlAvailabilityOptions {
  /** Request timeout in milliseconds (default: 5000). */
  timeout?: number
  /** HTTP status codes below this value are considered successful (default: 400). */
  successStatusBelow?: number
  /** User-Agent header to send with requests. */
  userAgent?: string
}

/**
 * Checks if a URL is accessible by making an HTTP request.
 * First tries a HEAD request, then falls back to GET if HEAD fails.
 * @param url - The URL to check.
 * @param options - Configuration options for the request.
 * @returns True if the URL responds with a status below `successStatusBelow`, false otherwise.
 */
export async function checkUrlAvailability(
  url: string,
  options: CheckUrlAvailabilityOptions = {},
): Promise<boolean> {
  if (!url) return false

  const {
    timeout = 5000,
    successStatusBelow = 400,
    userAgent = "Mozilla/5.0 (compatible; URLChecker/1.0)",
  } = options

  const normalizedUrl = normalizeUrl(url)

  async function makeRequest(method: "HEAD" | "GET"): Promise<Response | null> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      return await fetch(normalizedUrl, {
        method,
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": userAgent },
      })
    } catch {
      return null
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const headResponse = await makeRequest("HEAD")

  if (headResponse && headResponse.status < successStatusBelow) {
    return true
  }

  const getResponse = await makeRequest("GET")
  return getResponse !== null && getResponse.status < successStatusBelow
}

/**
 * Checks if a string is a valid image source: a relative path (e.g.
 * "/images/photo.png") or an absolute URL using a safe image protocol
 * (http, https, or data). Other protocols such as `javascript:` are rejected.
 * @param src - The image source string to validate.
 * @returns True if the source is a valid relative path or safe absolute URL.
 */
export function isValidImageSrc(src?: string | null): src is string {
  if (!src) return false
  if (/^\/\w/.test(src)) return true

  try {
    const { protocol } = new URL(src)
    return protocol === "http:" || protocol === "https:" || protocol === "data:"
  } catch {
    return false
  }
}

// Dot-separated labels ending in an alphabetic top-level domain: a hostname, not a brand name.
const HOSTNAME = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i

/**
 * Checks if a string is a bare hostname, such as "example.com", rather than a name like "Reddit".
 * @param value - The string to check.
 * @returns True if the string is a hostname with a top-level domain.
 */
export function isHostname(value: string): boolean {
  return HOSTNAME.test(value)
}

/**
 * Normalizes a hostname as typed or sent: trimmed, lowercased, without the root's trailing dot.
 * @param hostname - The hostname to normalize.
 * @returns The normalized hostname.
 */
export function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.$/, "")
}

/**
 * Removes a leading wildcard label: `*.example.com` covers what `example.com` does.
 * @param domain - The domain, with or without a wildcard.
 * @returns The domain without its wildcard label.
 */
export function stripWildcard(domain: string): string {
  return domain.replace(/^\*\./, "")
}

/**
 * Checks if a hostname is a domain or one of its subdomains.
 * `example.com` and `*.example.com` both cover `example.com` and `app.example.com`.
 * @param hostname - The hostname to check.
 * @param domain - The domain, with or without a wildcard.
 * @returns True if the hostname is the domain or sits under it.
 */
export function isWithinDomain(hostname: string, domain: string): boolean {
  const host = normalizeHostname(hostname)
  const base = normalizeHostname(stripWildcard(domain))

  if (!host || !base) return false

  return host === base || host.endsWith(`.${base}`)
}
