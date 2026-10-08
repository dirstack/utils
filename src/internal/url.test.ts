import { describe, expect, it, vi } from "vitest"
import { isLocalhostUrl, normalizeUrl, trimSlashes } from "./url"

describe("normalizeUrl", () => {
  it("removes trailing slashes", () => {
    expect(normalizeUrl("https://example.com/")).toBe("https://example.com")
    expect(normalizeUrl("https://example.com/docs//")).toBe("https://example.com/docs")
    expect(normalizeUrl("https://example.com/docs//?page=2")).toBe(
      "https://example.com/docs?page=2",
    )
  })

  it("keeps a lone root slash", () => {
    expect(normalizeUrl("/")).toBe("/")
    expect(normalizeUrl("https://example.com/path/")).toBe("https://example.com/path")
  })

  it("preserves root slash", () => {
    expect(normalizeUrl("/")).toBe("/")
  })

  it("trims whitespace", () => {
    expect(normalizeUrl("  https://example.com  ")).toBe("https://example.com")
  })

  it("handles URLs without trailing slash", () => {
    expect(normalizeUrl("https://example.com/path")).toBe("https://example.com/path")
  })

  it("handles empty input", () => {
    expect(normalizeUrl()).toBe("")
    expect(normalizeUrl("")).toBe("")
  })

  it("removes trailing slash from URL", () => {
    const url = "https://example.com/"
    const expected = "https://example.com"
    expect(normalizeUrl(url)).toBe(expected)
  })

  it("removes trailing slash from URL with path", () => {
    const url = "https://example.com/path/"
    const expected = "https://example.com/path"
    expect(normalizeUrl(url)).toBe(expected)
  })

  it("does not remove slash from root URL", () => {
    const url = "/"
    const expected = "/"
    expect(normalizeUrl(url)).toBe(expected)
  })

  it("returns URL unchanged when no trailing slash", () => {
    const url = "https://example.com/path"
    const expected = "https://example.com/path"
    expect(normalizeUrl(url)).toBe(expected)
  })

  it("returns empty string for undefined input", () => {
    expect(normalizeUrl()).toBe("")
  })

  it("handles URLs with query parameters and trailing slash", () => {
    const url = "https://example.com/path/?param=value"
    const expected = "https://example.com/path?param=value"
    expect(normalizeUrl(url)).toBe(expected)
  })
})

describe("isLocalhostUrl", () => {
  it("parses a URL without a protocol only once", () => {
    const spy = vi.spyOn(globalThis, "URL")

    expect(isLocalhostUrl("localhost:3000")).toBe(true)
    expect(spy).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })

  it("identifies localhost URLs", () => {
    expect(isLocalhostUrl("http://localhost:3000")).toBe(true)
    expect(isLocalhostUrl("https://localhost")).toBe(true)
    expect(isLocalhostUrl("http://127.0.0.1:8080")).toBe(true)
    expect(isLocalhostUrl("localhost:3000")).toBe(true)
  })

  it("identifies IPv6 loopback and protocol-relative URLs", () => {
    expect(isLocalhostUrl("http://[::1]:3000")).toBe(true)
    expect(isLocalhostUrl("//localhost:3000/app.js")).toBe(true)
  })

  it("identifies non-localhost URLs", () => {
    expect(isLocalhostUrl("https://example.com")).toBe(false)
    expect(isLocalhostUrl("")).toBe(false)
    expect(isLocalhostUrl()).toBe(false)
  })
})

describe("trimSlashes", () => {
  it("removes slashes from both ends", () => {
    expect(trimSlashes("//api/users//")).toBe("api/users")
    expect(trimSlashes("///")).toBe("")
    expect(trimSlashes("users")).toBe("users")
  })
})

describe("slash trimming on long runs of slashes", () => {
  // A regex such as /\/+$/ takes seconds on this input; the loops take well under a millisecond.
  const slashes = `a${"/".repeat(100_000)}x`

  it("normalizes in linear time", () => {
    const start = performance.now()
    normalizeUrl(slashes)
    trimSlashes(slashes)
    expect(performance.now() - start).toBeLessThan(100)
  })
})
