import { afterEach, describe, expect, it, mock } from "bun:test"

import {
  addProtocol,
  checkUrlAvailability,
  getBaseUrl,
  getDomain,
  getQueryParams,
  isExternalUrl,
  isLocalhostUrl,
  isValidUrl,
  joinUrlPaths,
  normalizeUrl,
  removeProtocol,
  removeQueryParams,
  setQueryParams,
} from "./http"

describe("isValidUrl", () => {
  it("validates correct URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true)
    expect(isValidUrl("http://localhost:3000")).toBe(true)
    expect(isValidUrl("https://www.example.com/path?query=value#hash")).toBe(true)
  })

  it("validates URLs with longer TLDs", () => {
    expect(isValidUrl("https://example.storage")).toBe(true)
    expect(isValidUrl("https://mysite.directory")).toBe(true)
    expect(isValidUrl("http://www.example.storage")).toBe(true)
    expect(isValidUrl("https://api.myapp.directory/path")).toBe(true)
    expect(isValidUrl("https://subdomain.example.storage?param=value")).toBe(true)
  })

  it("rejects invalid URLs", () => {
    expect(isValidUrl("not a url")).toBe(false)
    expect(isValidUrl("example.com")).toBe(false)
    expect(isValidUrl("")).toBe(false)
    expect(isValidUrl()).toBe(false)
    expect(isValidUrl("ftp://example.com")).toBe(false)
  })

  it("handles edge cases", () => {
    expect(isValidUrl(null as any)).toBe(false)
    expect(isValidUrl(123 as any)).toBe(false)
  })
})

describe("addProtocol", () => {
  it("adds https protocol by default", () => {
    expect(addProtocol("example.com")).toBe("https://example.com")
  })

  it("adds http protocol for localhost", () => {
    expect(addProtocol("localhost:3000")).toBe("http://localhost:3000")
    expect(addProtocol("127.0.0.1:8080")).toBe("http://127.0.0.1:8080")
  })

  it("respects explicit secure parameter", () => {
    expect(addProtocol("example.com", true)).toBe("https://example.com")
    expect(addProtocol("example.com", false)).toBe("http://example.com")
    expect(addProtocol("localhost:3000", true)).toBe("https://localhost:3000")
  })

  it("doesn't modify URLs that already have protocol", () => {
    expect(addProtocol("https://example.com")).toBe("https://example.com")
    expect(addProtocol("http://example.com")).toBe("http://example.com")
  })

  it("handles empty input", () => {
    expect(addProtocol()).toBe("")
    expect(addProtocol("")).toBe("")
  })
})

describe("removeProtocol", () => {
  it("removes https protocol", () => {
    expect(removeProtocol("https://example.com")).toBe("example.com")
  })

  it("removes http protocol", () => {
    expect(removeProtocol("http://localhost:3000")).toBe("localhost:3000")
  })

  it("handles URLs without protocol", () => {
    expect(removeProtocol("example.com")).toBe("example.com")
  })

  it("handles empty input", () => {
    expect(removeProtocol()).toBe("")
    expect(removeProtocol("")).toBe("")
  })
})

describe("normalizeUrl", () => {
  it("removes trailing slashes", () => {
    expect(normalizeUrl("https://example.com/")).toBe("https://example.com")
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

describe("removeQueryParams", () => {
  it("removes single query parameter", () => {
    expect(removeQueryParams("https://example.com?param=value")).toBe("https://example.com")
  })

  it("removes multiple query parameters", () => {
    expect(removeQueryParams("https://example.com/path?param1=value1&param2=value2")).toBe(
      "https://example.com/path",
    )
  })

  it("preserves hash fragment", () => {
    expect(removeQueryParams("https://example.com/path?param=value#fragment")).toBe(
      "https://example.com/path#fragment",
    )
  })

  it("handles URLs without query params", () => {
    expect(removeQueryParams("https://example.com/path")).toBe("https://example.com/path")
  })

  it("handles invalid URLs with fallback", () => {
    expect(removeQueryParams("invalid-url?param=value")).toBe("invalid-url")
  })

  it("handles empty input", () => {
    expect(removeQueryParams()).toBe("")
  })
})

describe("getBaseUrl", () => {
  it("returns protocol and host", () => {
    expect(getBaseUrl("https://example.com/path/to/resource")).toBe("https://example.com")
    expect(getBaseUrl("http://localhost:3000/dashboard")).toBe("http://localhost:3000")
  })

  it("handles URLs with query and hash", () => {
    expect(getBaseUrl("https://example.com/path?query=value#hash")).toBe("https://example.com")
  })

  it("returns original for invalid URLs", () => {
    expect(getBaseUrl("not-a-url")).toBe("not-a-url")
  })
})

describe("getDomain", () => {
  it("extracts domain from valid URLs", () => {
    expect(getDomain("https://example.com")).toBe("example.com")
    expect(getDomain("https://www.example.com")).toBe("example.com")
  })

  it("handles subdomains", () => {
    expect(getDomain("https://api.example.com")).toBe("api.example.com")
    expect(getDomain("https://www.api.example.com")).toBe("api.example.com")
  })

  it("returns original for invalid URLs", () => {
    expect(getDomain("not-a-url")).toBe("not-a-url")
  })
})

describe("isExternalUrl", () => {
  it("identifies external URLs", () => {
    expect(isExternalUrl("https://example.com")).toBe(true)
    expect(isExternalUrl("http://example.com")).toBe(true)
  })

  it("identifies non-external URLs", () => {
    expect(isExternalUrl("example.com")).toBe(false)
    expect(isExternalUrl("/path")).toBe(false)
    expect(isExternalUrl("")).toBe(false)
    expect(isExternalUrl()).toBe(false)
  })
})

describe("isLocalhostUrl", () => {
  it("identifies localhost URLs", () => {
    expect(isLocalhostUrl("http://localhost:3000")).toBe(true)
    expect(isLocalhostUrl("https://localhost")).toBe(true)
    expect(isLocalhostUrl("http://127.0.0.1:8080")).toBe(true)
    expect(isLocalhostUrl("localhost:3000")).toBe(true)
  })

  it("identifies non-localhost URLs", () => {
    expect(isLocalhostUrl("https://example.com")).toBe(false)
    expect(isLocalhostUrl("")).toBe(false)
    expect(isLocalhostUrl()).toBe(false)
  })
})

describe("joinUrlPaths", () => {
  it("joins paths correctly", () => {
    expect(joinUrlPaths("https://example.com", "api", "users")).toBe(
      "https://example.com/api/users",
    )
    expect(joinUrlPaths("https://example.com/", "/api/", "/users/")).toBe(
      "https://example.com/api/users",
    )
  })

  it("handles empty paths", () => {
    expect(joinUrlPaths("https://example.com", "", "users")).toBe("https://example.com/users")
  })

  it("handles single path", () => {
    expect(joinUrlPaths("https://example.com")).toBe("https://example.com")
  })

  it("handles empty base", () => {
    expect(joinUrlPaths("")).toBe("")
  })
})

describe("getQueryParams", () => {
  it("extracts query parameters", () => {
    const params = getQueryParams("https://example.com?name=john&age=30")
    expect(params).toEqual({ name: "john", age: "30" })
  })

  it("handles URLs without parameters", () => {
    expect(getQueryParams("https://example.com")).toEqual({})
  })

  it("handles invalid URLs", () => {
    expect(getQueryParams("not-a-url")).toEqual({})
  })
})

describe("setQueryParams", () => {
  it("adds query parameters", () => {
    const result = setQueryParams("https://example.com", {
      name: "john",
      age: 30,
    })
    expect(result).toBe("https://example.com?name=john&age=30")
  })

  it("updates existing parameters", () => {
    const result = setQueryParams("https://example.com?name=jane", {
      name: "john",
      age: 30,
    })
    expect(result).toBe("https://example.com?name=john&age=30")
  })

  it("handles boolean values", () => {
    const result = setQueryParams("https://example.com", { active: true })
    expect(result).toBe("https://example.com?active=true")
  })

  it("handles invalid URLs", () => {
    expect(setQueryParams("not-a-url", { param: "value" })).toBe("not-a-url")
  })
})

describe("checkUrlAvailability", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("returns false for empty URL", async () => {
    expect(await checkUrlAvailability("")).toBe(false)
  })

  it("returns true when HEAD request succeeds with status < 400", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(null, { status: 200 })),
    ) as unknown as typeof fetch

    const result = await checkUrlAvailability("https://example.com")
    expect(result).toBe(true)
  })

  it("returns true for redirect statuses (3xx)", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(null, { status: 301 })),
    ) as unknown as typeof fetch

    const result = await checkUrlAvailability("https://example.com")
    expect(result).toBe(true)
  })

  it("returns false for client error statuses (4xx)", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(null, { status: 404 })),
    ) as unknown as typeof fetch

    const result = await checkUrlAvailability("https://example.com")
    expect(result).toBe(false)
  })

  it("returns false for server error statuses (5xx)", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(null, { status: 500 })),
    ) as unknown as typeof fetch

    const result = await checkUrlAvailability("https://example.com")
    expect(result).toBe(false)
  })

  it("falls back to GET when HEAD throws error", async () => {
    let callCount = 0
    globalThis.fetch = mock((_url: string, options?: RequestInit) => {
      callCount++
      if (options?.method === "HEAD") {
        return Promise.reject(new Error("HEAD not supported"))
      }
      return Promise.resolve(new Response(null, { status: 200 }))
    }) as unknown as typeof fetch

    const result = await checkUrlAvailability("https://example.com")
    expect(result).toBe(true)
    expect(callCount).toBe(2)
  })

  it("falls back to GET when HEAD returns error status", async () => {
    let callCount = 0
    globalThis.fetch = mock((_url: string, options?: RequestInit) => {
      callCount++
      if (options?.method === "HEAD") {
        return Promise.resolve(new Response(null, { status: 404 }))
      }
      return Promise.resolve(new Response(null, { status: 200 }))
    }) as unknown as typeof fetch

    const result = await checkUrlAvailability("https://example.com")
    expect(result).toBe(true)
    expect(callCount).toBe(2)
  })

  it("returns false when both HEAD and GET fail", async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error("Network error")),
    ) as unknown as typeof fetch

    const result = await checkUrlAvailability("https://example.com")
    expect(result).toBe(false)
  })

  it("returns false when HEAD returns error and GET also returns error status", async () => {
    globalThis.fetch = mock((_url: string, options?: RequestInit) => {
      if (options?.method === "HEAD") {
        return Promise.resolve(new Response(null, { status: 404 }))
      }
      return Promise.resolve(new Response(null, { status: 500 }))
    }) as unknown as typeof fetch

    const result = await checkUrlAvailability("https://example.com")
    expect(result).toBe(false)
  })

  it("uses custom timeout option", async () => {
    let receivedSignal: AbortSignal | null | undefined
    globalThis.fetch = mock((_url: string, options?: RequestInit) => {
      receivedSignal = options?.signal
      return Promise.resolve(new Response(null, { status: 200 }))
    }) as unknown as typeof fetch

    await checkUrlAvailability("https://example.com", { timeout: 10000 })
    expect(receivedSignal).toBeDefined()
  })

  it("uses custom userAgent option", async () => {
    let receivedHeaders: HeadersInit | undefined
    globalThis.fetch = mock((_url: string, options?: RequestInit) => {
      receivedHeaders = options?.headers
      return Promise.resolve(new Response(null, { status: 200 }))
    }) as unknown as typeof fetch

    await checkUrlAvailability("https://example.com", { userAgent: "CustomBot/1.0" })
    expect(receivedHeaders).toEqual({ "User-Agent": "CustomBot/1.0" })
  })

  it("uses default userAgent when not specified", async () => {
    let receivedHeaders: HeadersInit | undefined
    globalThis.fetch = mock((_url: string, options?: RequestInit) => {
      receivedHeaders = options?.headers
      return Promise.resolve(new Response(null, { status: 200 }))
    }) as unknown as typeof fetch

    await checkUrlAvailability("https://example.com")
    expect(receivedHeaders).toEqual({ "User-Agent": "Mozilla/5.0 (compatible; URLChecker/1.0)" })
  })

  it("normalizes URL before checking", async () => {
    let receivedUrl: string | undefined
    globalThis.fetch = mock((url: string) => {
      receivedUrl = url
      return Promise.resolve(new Response(null, { status: 200 }))
    }) as unknown as typeof fetch

    await checkUrlAvailability("https://example.com/path/")
    expect(receivedUrl).toBe("https://example.com/path")
  })

  it("uses custom successStatusBelow to accept only 2xx responses", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(null, { status: 301 })),
    ) as unknown as typeof fetch

    const defaultResult = await checkUrlAvailability("https://example.com")
    expect(defaultResult).toBe(true)

    const strictResult = await checkUrlAvailability("https://example.com", {
      successStatusBelow: 300,
    })
    expect(strictResult).toBe(false)
  })

  it("uses custom successStatusBelow to accept 4xx responses", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(null, { status: 404 })),
    ) as unknown as typeof fetch

    const defaultResult = await checkUrlAvailability("https://example.com")
    expect(defaultResult).toBe(false)

    const lenientResult = await checkUrlAvailability("https://example.com", {
      successStatusBelow: 500,
    })
    expect(lenientResult).toBe(true)
  })
})
