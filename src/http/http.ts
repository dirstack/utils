/**
 * Utility functions for URLs, hostnames and IP addresses.
 */

import { HTTP_PROTOCOL, isLocalhostUrl, normalizeUrl, trimSlashes } from "../internal/url.js"

/** An http(s) protocol in any letter case, or the "//" of a protocol-relative URL. */
const ABSOLUTE_URL = /^(https?:)?\/\//i

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
 * Adds a protocol to a URL string that has none, including a protocol-relative "//host" URL.
 * @param url - The URL string without protocol.
 * @param secure - Whether to use https. Defaults to true, or false for localhost URLs.
 * @returns The URL with a protocol.
 */
export function addProtocol(url?: string, secure?: boolean): string {
  if (!url) return ""
  if (HTTP_PROTOCOL.test(url)) return url

  const protocol = (secure ?? !isLocalhostUrl(url)) ? "https" : "http"

  return url.startsWith("//") ? `${protocol}:${url}` : `${protocol}://${url}`
}

/**
 * Removes the http(s) protocol, in any letter case, or the "//" of a protocol-relative URL.
 * @param url - The URL string with protocol.
 * @returns The URL without protocol.
 */
export function removeProtocol(url?: string): string {
  return url?.replace(ABSOLUTE_URL, "") ?? ""
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
 * Checks if a URL is absolute, meaning it starts with an http(s) protocol (in any letter case)
 * or is protocol-relative ("//host/path"), as opposed to a path such as "/about".
 * It does not compare hosts: a full URL to your own site counts as external too.
 * @param url - The URL to check.
 * @returns True if the URL starts with a protocol or "//".
 */
export function isExternalUrl(url?: string): boolean {
  if (!url) return false
  return ABSOLUTE_URL.test(url)
}

/**
 * Joins URL path segments with single slashes.
 * @param base - The base URL. Trailing slashes are removed.
 * @param paths - The path segments to join. Leading and trailing slashes are removed.
 * @returns The combined URL.
 */
export function joinUrlPaths(base: string, ...paths: string[]): string {
  if (!base) return ""

  let result = normalizeUrl(base)

  for (const path of paths) {
    if (!path) continue

    const trimmedPath = trimSlashes(path)
    if (trimmedPath) result += `/${trimmedPath}`
  }

  return result
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

    // Drop the root slash before the query, so "example.com/?page=2" becomes "example.com?page=2".
    // A slash at the end of a longer path is part of the path and stays.
    const result = parsedUrl.toString()
    return parsedUrl.pathname === "/"
      ? result.replace(`${parsedUrl.origin}/?`, `${parsedUrl.origin}?`)
      : result
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

/**
 * The IP ranges Cloudflare proxies traffic from, IPv4 first, then IPv6.
 * Update from https://www.cloudflare.com/ips/ when Cloudflare publishes changes.
 */
export const CLOUDFLARE_IP_RANGES: readonly string[] = [
  "173.245.48.0/20",
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "141.101.64.0/18",
  "108.162.192.0/18",
  "190.93.240.0/20",
  "188.114.96.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
  "162.158.0.0/15",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "172.64.0.0/13",
  "131.0.72.0/22",
  "2400:cb00::/32",
  "2606:4700::/32",
  "2803:f800::/32",
  "2405:b500::/32",
  "2405:8100::/32",
  "2a06:98c0::/29",
  "2c0f:f248::/32",
]

// Four decimal octets without leading zeros, so "010.0.0.1" is not read as octal or decimal.
const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
const IPV6_GROUP = /^[0-9a-f]{1,4}$/i

/**
 * Parses a dotted IPv4 address into its 4 bytes.
 */
function parseIpv4(value: string) {
  if (!IPV4.test(value)) return

  return value.split(".").map(Number)
}

/**
 * Parses an IPv6 address into its 16 bytes. Handles `::` compression and a trailing dotted
 * IPv4 part, as in `::ffff:192.0.2.1`. Zone IDs such as `%eth0` are rejected.
 */
function parseIpv6(value: string) {
  let address = value
  const lastColon = address.lastIndexOf(":")

  // Rewrite a trailing dotted IPv4 part as two hex groups.
  if (lastColon !== -1 && address.includes(".", lastColon)) {
    const ipv4 = parseIpv4(address.slice(lastColon + 1))
    if (!ipv4) return

    const [a = 0, b = 0, c = 0, d = 0] = ipv4
    address = `${address.slice(0, lastColon + 1)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`
  }

  const halves = address.split("::")
  if (halves.length > 2) return

  const [head = "", tail = ""] = halves
  const headGroups = head ? head.split(":") : []
  const tailGroups = tail ? tail.split(":") : []
  const groupCount = headGroups.length + tailGroups.length

  // Without "::" the address needs all 8 groups. With it, "::" stands for at least one group.
  if (halves.length === 1 ? groupCount !== 8 : groupCount > 7) return
  if (![...headGroups, ...tailGroups].every(group => IPV6_GROUP.test(group))) return

  const groups = [...headGroups, ...Array<string>(8 - groupCount).fill("0"), ...tailGroups].map(
    group => Number.parseInt(group, 16),
  )

  return groups.flatMap(group => [group >> 8, group & 0xff])
}

/**
 * Parses an IPv4 or IPv6 address into 16 bytes. IPv4 becomes its IPv4-mapped IPv6 form
 * (`::ffff:a.b.c.d`), so both spellings of the same address compare equal.
 */
function parseIp(value: string) {
  const ipv4 = parseIpv4(value)
  if (ipv4) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, ...ipv4]

  return parseIpv6(value)
}

/**
 * Checks if a string is a valid IPv4 or IPv6 address, such as "192.0.2.1" or "2001:db8::1".
 * IPv6 zone IDs (`fe80::1%eth0`) and IPv4 with leading zeros (`010.0.0.1`) are rejected.
 * @param value - The string to check.
 * @returns True if the string is an IP address.
 */
export function isIp(value: string): boolean {
  return parseIp(value) !== undefined
}

/**
 * Checks if an IP address falls within a CIDR range, such as "192.0.2.0/24" or "2001:db8::/32".
 * An IPv4 address matches its IPv4-mapped IPv6 form (`::ffff:192.0.2.1`) and the other way round.
 * @param ip - The IP address to check.
 * @param cidr - The range, as an address and a prefix length.
 * @returns True if the address is in the range. False if either argument is malformed.
 */
export function isIpInRange(ip: string, cidr: string): boolean {
  const [network = "", prefix = "", ...rest] = cidr.split("/")
  if (rest.length || !/^\d{1,3}$/.test(prefix)) return false

  const ipBytes = parseIp(ip)
  const networkBytes = parseIp(network)
  if (!ipBytes || !networkBytes) return false

  // An IPv4 network is parsed into its mapped form, so its prefix moves past the 96-bit "::ffff:" part.
  const bits = Number(prefix) + (IPV4.test(network) ? 96 : 0)
  if (bits > 128) return false

  const fullBytes = Math.floor(bits / 8)

  for (let index = 0; index < fullBytes; index++) {
    if (ipBytes[index] !== networkBytes[index]) return false
  }

  const remainingBits = bits % 8
  if (!remainingBits) return true

  const mask = (0xff << (8 - remainingBits)) & 0xff
  return ((ipBytes[fullBytes] ?? 0) & mask) === ((networkBytes[fullBytes] ?? 0) & mask)
}

/**
 * Checks if an IP address belongs to Cloudflare, using {@link CLOUDFLARE_IP_RANGES}.
 * @param ip - The IP address to check, IPv4, IPv6 or IPv4-mapped IPv6.
 * @returns True if the address is in a Cloudflare range.
 */
export function isCloudflareIp(ip: string): boolean {
  return CLOUDFLARE_IP_RANGES.some(range => isIpInRange(ip, range))
}

/** Options for {@link getClientIp}. */
export interface GetClientIpOptions {
  /**
   * Read `cf-connecting-ip` when the request came through Cloudflare. Set it when the site sits
   * behind proxied Cloudflare records. Off by default.
   */
  trust?: "cloudflare"
}

/**
 * Gets the visitor's IP address from request headers set by a reverse proxy such as Traefik.
 *
 * The first `x-forwarded-for` entry is whatever the client sent, so it is never read. The proxy
 * appends the TCP peer as the last entry, and that peer is the address returned. With
 * `trust: "cloudflare"`, `cf-connecting-ip` is returned instead, but only when the peer is a
 * Cloudflare address, because a direct request to the origin can set that header to anything.
 * @param headers - The request headers.
 * @param options - Which CDN to trust for the visitor's address.
 * @returns The client IP, or undefined when no header holds a valid IP address.
 * @example
 * getClientIp(request.headers) ?? "127.0.0.1"
 * getClientIp(request.headers, { trust: "cloudflare" })
 */
export function getClientIp(headers: Headers, options?: GetClientIpOptions): string | undefined {
  const peer = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim()

  if (options?.trust === "cloudflare" && peer && isCloudflareIp(peer)) {
    const visitor = headers.get("cf-connecting-ip")?.trim()
    if (visitor && isIp(visitor)) return visitor
  }

  if (peer && isIp(peer)) return peer

  const realIp = headers.get("x-real-ip")?.trim()
  if (realIp && isIp(realIp)) return realIp
}
