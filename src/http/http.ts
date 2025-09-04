/**
 * Utility functions for URL manipulation and validation.
 */

/**
 * Enhanced URL validation using regex pattern and URL constructor
 * Supports both regular domains and localhost/IP addresses
 */
const URL_REGEX =
  /^https?:\/\/(?:www\.)?(?:[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b|localhost(?::\d+)?|127\.0\.0\.1(?::\d+)?)(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/

/**
 * Checks if a URL is valid using both regex and URL constructor validation
 * @param url - The URL to validate
 * @returns True if the URL is valid
 */
export const isValidUrl = (url?: string): boolean => {
  if (!url || typeof url !== "string") return false

  // First check with regex for basic format
  if (!URL_REGEX.test(url)) return false

  // Then validate with URL constructor
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Adds protocol to a URL string
 * @param url - The URL string without protocol
 * @param secure - Whether to use https (default: true, false for localhost)
 * @returns URL with protocol added
 */
export const addProtocol = (url?: string, secure?: boolean): string => {
  if (!url) return ""

  // Don't add protocol if already present
  if (url.startsWith("http://") || url.startsWith("https://")) return url

  // Determine protocol based on secure flag and URL
  const protocol =
    secure !== undefined ? (secure ? "https" : "http") : isLocalhostUrl(url) ? "http" : "https"

  return `${protocol}://${url}`
}

/**
 * Removes protocol from a URL string
 * @param url - The URL string with protocol
 * @returns URL without protocol
 */
export const removeProtocol = (url?: string): string => {
  return url?.replace(/^https?:\/\//, "") ?? ""
}

/**
 * Normalizes a URL by removing trailing slashes and cleaning up format
 * @param url - The URL to normalize
 * @returns Normalized URL
 */
export const normalizeUrl = (url?: string): string => {
  if (!url) return ""

  let normalized = url.trim()

  // Handle URLs with query parameters or hash fragments
  if (normalized.includes("?") || normalized.includes("#")) {
    try {
      const parsedUrl = new URL(normalized)
      // Remove trailing slash from pathname only
      if (parsedUrl.pathname.length > 1 && parsedUrl.pathname.endsWith("/")) {
        parsedUrl.pathname = parsedUrl.pathname.slice(0, -1)
      }
      return parsedUrl.toString()
    } catch {
      // Fallback for invalid URLs - just remove trailing slash if no query/hash
      return normalized.length > 1 && normalized.endsWith("/")
        ? normalized.slice(0, -1)
        : normalized
    }
  }

  // Simple case: remove trailing slash but keep root slash
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1)
  }

  return normalized
}

/**
 * Gets the base URL (protocol + hostname + port)
 * @param url - The URL string
 * @returns Base URL without path, search, or hash
 */
export const getBaseUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url)
    return `${parsedUrl.protocol}//${parsedUrl.host}`
  } catch {
    return url
  }
}

/**
 * Extracts the domain name from a URL
 * @param url - The URL string
 * @returns Domain name without www prefix
 */
export const getDomain = (url: string): string => {
  try {
    if (!isValidUrl(url)) return url

    const hostname = new URL(url).hostname
    return hostname.startsWith("www.") ? hostname.slice(4) : hostname
  } catch {
    return url
  }
}

/**
 * Checks if a URL is external (has protocol)
 * @param url - The URL to check
 * @returns True if URL is external (contains protocol)
 */
export const isExternalUrl = (url?: string): boolean => {
  if (!url) return false
  return /^https?:\/\//.test(url)
}

/**
 * Checks if a URL is a localhost URL
 * @param url - The URL to check
 * @returns True if URL points to localhost
 */
export const isLocalhostUrl = (url?: string): boolean => {
  if (!url) return false

  try {
    const parsedUrl = new URL(addProtocol(url))
    const hostname = parsedUrl.hostname
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost")
  } catch {
    return url.includes("localhost") || url.includes("127.0.0.1")
  }
}

/**
 * Joins URL paths safely
 * @param base - Base URL
 * @param paths - Path segments to join
 * @returns Combined URL
 */
export const joinUrlPaths = (base: string, ...paths: string[]): string => {
  if (!base) return ""

  let result = normalizeUrl(base)

  for (const path of paths) {
    if (!path) continue

    const cleanPath = path.replace(/^\/+|\/+$/g, "") // Remove leading/trailing slashes
    if (cleanPath) {
      result += `/${cleanPath}`
    }
  }

  return result
}

/**
 * Extracts query parameters from a URL
 * @param url - The URL string
 * @returns Object containing query parameters
 */
export const getQueryParams = (url: string): Record<string, string> => {
  try {
    const parsedUrl = new URL(url)
    const params: Record<string, string> = {}

    parsedUrl.searchParams.forEach((value, key) => {
      params[key] = value
    })

    return params
  } catch {
    return {}
  }
}

/**
 * Adds or updates query parameters in a URL
 * @param url - The base URL
 * @param params - Parameters to add/update
 * @returns URL with updated parameters
 */
export const setQueryParams = (
  url: string,
  params: Record<string, string | number | boolean>,
): string => {
  try {
    const parsedUrl = new URL(url)

    Object.entries(params).forEach(([key, value]) => {
      parsedUrl.searchParams.set(key, String(value))
    })

    let result = parsedUrl.toString()

    // Special case: remove trailing slash before query parameters for cleaner URLs
    result = result.replace(/\/\?/, "?")

    return result
  } catch {
    return url
  }
}

/**
 * Removes query parameters from a URL
 * @param url - The URL string
 * @returns URL without query parameters
 */
export const removeQueryParams = (url?: string): string => {
  if (!url) return ""

  try {
    const parsedUrl = new URL(url)
    parsedUrl.search = ""
    return normalizeUrl(parsedUrl.toString())
  } catch {
    // For invalid URLs, try simple string manipulation
    const questionIndex = url.indexOf("?")
    return questionIndex !== -1 ? url.substring(0, questionIndex) : url
  }
}

// Legacy aliases for backward compatibility (deprecated)
/** @deprecated Use addProtocol instead */
export const addHttp = addProtocol

/** @deprecated Use removeProtocol instead */
export const removeHttp = removeProtocol

/** @deprecated Use normalizeUrl instead */
export const removeTrailingSlash = normalizeUrl

/** @deprecated Use normalizeUrl instead */
export const stripTrailingSlash = normalizeUrl

/** @deprecated Use getBaseUrl instead */
export const stripURLSubpath = getBaseUrl

/** @deprecated Use getDomain instead */
export const getUrlHostname = getDomain

/** @deprecated Use removeQueryParams instead */
export const removeSearchParams = removeQueryParams

/** @deprecated Use getQueryParams instead */
export const getSearchParams = getQueryParams

/** @deprecated Use setQueryParams instead */
export const addSearchParams = setQueryParams
