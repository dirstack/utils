import { describe, expect, it } from "bun:test"

import {
    // Legacy aliases
    addHttp,
    addProtocol,
    getBaseUrl,
    getDomain,
    getQueryParams,
    getUrlHostname,
    isExternalUrl,
    isLocalhostUrl,
    isValidUrl,
    joinUrlPaths,
    normalizeUrl,
    removeHttp,
    removeProtocol,
    removeQueryParams,
    removeTrailingSlash,
    setQueryParams,
    stripTrailingSlash,
    stripURLSubpath
} from "./http"

describe("isValidUrl", () => {
  it("validates correct URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true)
    expect(isValidUrl("http://localhost:3000")).toBe(true)
    expect(isValidUrl("https://www.example.com/path?query=value#hash")).toBe(true)
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
})

describe("stripTrailingSlash", () => {
  it("removes trailing slash from URL", () => {
    const url = "https://example.com/"
    const expected = "https://example.com"
    expect(stripTrailingSlash(url)).toBe(expected)
  })

  it("removes trailing slash from URL with path", () => {
    const url = "https://example.com/path/"
    const expected = "https://example.com/path"
    expect(stripTrailingSlash(url)).toBe(expected)
  })

  it("does not remove slash from root URL", () => {
    const url = "/"
    const expected = "/"
    expect(stripTrailingSlash(url)).toBe(expected)
  })

  it("returns URL unchanged when no trailing slash", () => {
    const url = "https://example.com/path"
    const expected = "https://example.com/path"
    expect(stripTrailingSlash(url)).toBe(expected)
  })

  it("returns empty string for undefined input", () => {
    expect(stripTrailingSlash()).toBe("")
  })

  it("handles URLs with query parameters and trailing slash", () => {
    const url = "https://example.com/path/?param=value"
    const expected = "https://example.com/path?param=value"
    expect(stripTrailingSlash(url)).toBe(expected)
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

// Legacy alias tests
describe("Legacy aliases", () => {
  it("addHttp works as addProtocol", () => {
    expect(addHttp("example.com")).toBe("https://example.com")
  })

  it("removeHttp works as removeProtocol", () => {
    expect(removeHttp("https://example.com")).toBe("example.com")
  })

  it("removeTrailingSlash works as normalizeUrl", () => {
    expect(removeTrailingSlash("https://example.com/")).toBe("https://example.com")
  })

  it("stripTrailingSlash works as normalizeUrl", () => {
    expect(stripTrailingSlash("https://example.com/")).toBe("https://example.com")
  })

  it("stripURLSubpath works as getBaseUrl", () => {
    expect(stripURLSubpath("https://example.com/path")).toBe("https://example.com")
  })

  it("getUrlHostname works as getDomain", () => {
    expect(getUrlHostname("https://www.example.com")).toBe("example.com")
  })
})
