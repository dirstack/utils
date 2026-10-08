import { describe, expect, it } from "vitest"
import {
  addProtocol,
  getDomain,
  isExternalUrl,
  isHostname,
  isValidImageSrc,
  isValidUrl,
  isWithinDomain,
  joinUrlPaths,
  normalizeHostname,
  removeProtocol,
  removeQueryParams,
  setQueryParams,
  stripWildcard,
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
    expect(isValidUrl(null as never)).toBe(false)
    expect(isValidUrl(123 as never)).toBe(false)
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

describe("isValidImageSrc", () => {
  it("validates absolute URLs", () => {
    expect(isValidImageSrc("https://example.com/image.png")).toBe(true)
    expect(isValidImageSrc("http://localhost/img.jpg")).toBe(true)
    expect(isValidImageSrc("https://cdn.example.com/photos/pic.webp")).toBe(true)
  })

  it("validates relative paths", () => {
    expect(isValidImageSrc("/images/photo.png")).toBe(true)
    expect(isValidImageSrc("/img.jpg")).toBe(true)
    expect(isValidImageSrc("/assets/icons/logo.svg")).toBe(true)
  })

  it("validates data URIs", () => {
    expect(isValidImageSrc("data:image/png;base64,iVBOR")).toBe(true)
  })

  it("rejects falsy and invalid inputs", () => {
    expect(isValidImageSrc(null)).toBe(false)
    expect(isValidImageSrc(undefined)).toBe(false)
    expect(isValidImageSrc("")).toBe(false)
    expect(isValidImageSrc("not-a-url")).toBe(false)
  })

  it("rejects unsafe protocols", () => {
    expect(isValidImageSrc("javascript:alert(1)")).toBe(false)
    expect(isValidImageSrc("mailto:test@example.com")).toBe(false)
    expect(isValidImageSrc("tel:+123456789")).toBe(false)
  })

  it("handles edge cases", () => {
    expect(isValidImageSrc("/")).toBe(false)
    expect(isValidImageSrc("/ space")).toBe(false)
  })
})

describe("isHostname", () => {
  it("accepts a hostname with a top-level domain", () => {
    expect(isHostname("example.com")).toBe(true)
    expect(isHostname("app.9tools.io")).toBe(true)
  })

  it("rejects names, URLs and leading hyphens", () => {
    expect(isHostname("Reddit")).toBe(false)
    expect(isHostname("https://example.com")).toBe(false)
    expect(isHostname("-example.com")).toBe(false)
  })
})

describe("normalizeHostname", () => {
  it("trims, lowercases and drops the trailing dot", () => {
    expect(normalizeHostname(" Example.COM. ")).toBe("example.com")
  })
})

describe("stripWildcard", () => {
  it("removes only a leading wildcard label", () => {
    expect(stripWildcard("*.example.com")).toBe("example.com")
    expect(stripWildcard("example.com")).toBe("example.com")
  })
})

describe("isWithinDomain", () => {
  it("matches the domain and its subdomains only", () => {
    for (const host of ["example.com", "www.example.com", "a.b.example.com", "Example.COM."]) {
      expect(isWithinDomain(host, "example.com")).toBe(true)
    }

    for (const host of ["example.de", "notexample.com", "example.com.evil.io", ""]) {
      expect(isWithinDomain(host, "example.com")).toBe(false)
    }
  })

  it("treats a wildcard domain like the bare one", () => {
    expect(isWithinDomain("app.example.com", "*.example.com")).toBe(true)
    expect(isWithinDomain("example.com", "*.example.com")).toBe(true)
  })
})
