import { describe, expect, it } from "vitest"
import { formatBytes, isMimeTypeMatch } from "./files"

describe("formatBytes", () => {
  it("formats bytes correctly", () => {
    expect(formatBytes(0)).toEqual("0 B")
    expect(formatBytes(512)).toEqual("512 B")
    expect(formatBytes(1023)).toEqual("1023 B")
    expect(formatBytes(1024)).toEqual("1 KB")
    expect(formatBytes(1048576)).toEqual("1 MB")
    expect(formatBytes(1073741824)).toEqual("1 GB")
    expect(formatBytes(1099511627776)).toEqual("1 TB")
  })

  it("formats bytes with decimals correctly", () => {
    expect(formatBytes(1200, 1)).toEqual("1.2 KB")
    expect(formatBytes(1200000, 2)).toEqual("1.14 MB")
    expect(formatBytes(1200000000, 3)).toEqual("1.118 GB")
    expect(formatBytes(1200000000000, 4)).toEqual("1.0914 TB")
  })

  it("moves to the next unit when rounding reaches 1024", () => {
    expect(formatBytes(1024 * 1023.9)).toEqual("1 MB")
    expect(formatBytes(1024 * 1023.9, 1)).toEqual("1023.9 KB")
  })

  it("stops at the largest unit", () => {
    expect(formatBytes(1024 ** 8)).toEqual("1 YB")
    expect(formatBytes(1024 ** 9)).toEqual("1024 YB")
  })

  it("scales negative values like positive ones", () => {
    expect(formatBytes(-2048)).toEqual("-2 KB")
    expect(formatBytes(-512)).toEqual("-512 B")
  })

  it("returns non-finite values as bytes", () => {
    expect(formatBytes(Number.NaN)).toEqual("NaN B")
    expect(formatBytes(Number.POSITIVE_INFINITY)).toEqual("Infinity B")
  })
})

describe("isMimeTypeMatch", () => {
  it("should ignore letter case", () => {
    expect(isMimeTypeMatch("Image/PNG", ["image/*"])).toBe(true)
    expect(isMimeTypeMatch("image/png", ["IMAGE/PNG"])).toBe(true)
  })

  it("should ignore parameters", () => {
    expect(isMimeTypeMatch("text/plain; charset=utf-8", ["text/plain"])).toBe(true)
    expect(isMimeTypeMatch("text/plain", ["text/plain;charset=utf-8"])).toBe(true)
  })

  it("should support the match-all pattern", () => {
    expect(isMimeTypeMatch("image/png", ["*/*"])).toBe(true)
    expect(isMimeTypeMatch("application/pdf", ["*"])).toBe(true)
  })

  it("should reject a value that is not a MIME type", () => {
    expect(isMimeTypeMatch("", ["*/*"])).toBe(false)
    expect(isMimeTypeMatch("image", ["image/*"])).toBe(false)
  })

  it("should match exact MIME types", () => {
    expect(isMimeTypeMatch("image/jpeg", ["image/jpeg"])).toBe(true)
    expect(isMimeTypeMatch("text/plain", ["text/plain"])).toBe(true)
    expect(isMimeTypeMatch("application/json", ["application/json"])).toBe(true)
  })

  it("should match wildcard patterns", () => {
    expect(isMimeTypeMatch("image/jpeg", ["image/*"])).toBe(true)
    expect(isMimeTypeMatch("image/png", ["image/*"])).toBe(true)
    expect(isMimeTypeMatch("image/gif", ["image/*"])).toBe(true)
    expect(isMimeTypeMatch("text/html", ["text/*"])).toBe(true)
    expect(isMimeTypeMatch("text/css", ["text/*"])).toBe(true)
    expect(isMimeTypeMatch("application/pdf", ["application/*"])).toBe(true)
  })

  it("should not match different types", () => {
    expect(isMimeTypeMatch("image/jpeg", ["text/plain"])).toBe(false)
    expect(isMimeTypeMatch("text/plain", ["image/jpeg"])).toBe(false)
    expect(isMimeTypeMatch("application/json", ["image/*"])).toBe(false)
    expect(isMimeTypeMatch("text/html", ["image/*"])).toBe(false)
  })

  it("should not match different subtypes without wildcard", () => {
    expect(isMimeTypeMatch("image/jpeg", ["image/png"])).toBe(false)
    expect(isMimeTypeMatch("text/html", ["text/plain"])).toBe(false)
    expect(isMimeTypeMatch("application/json", ["application/xml"])).toBe(false)
  })

  it("should match against multiple patterns", () => {
    expect(isMimeTypeMatch("image/jpeg", ["image/*", "text/plain"])).toBe(true)
    expect(isMimeTypeMatch("text/plain", ["image/*", "text/plain"])).toBe(true)
    expect(isMimeTypeMatch("application/json", ["image/*", "text/plain", "application/json"])).toBe(
      true,
    )
  })

  it("should not match if none of the patterns match", () => {
    expect(isMimeTypeMatch("video/mp4", ["image/*", "text/plain"])).toBe(false)
    expect(isMimeTypeMatch("audio/mpeg", ["image/jpeg", "text/html"])).toBe(false)
  })

  it("should handle empty patterns array", () => {
    expect(isMimeTypeMatch("image/jpeg", [])).toBe(false)
    expect(isMimeTypeMatch("text/plain", [])).toBe(false)
  })

  it("should handle edge cases with MIME type format", () => {
    expect(isMimeTypeMatch("image/jpeg", ["image/jpeg"])).toBe(true)
    expect(isMimeTypeMatch("application/vnd.api+json", ["application/*"])).toBe(true)
    expect(isMimeTypeMatch("application/vnd.api+json", ["application/vnd.api+json"])).toBe(true)
  })

  it("should handle complex MIME types", () => {
    expect(
      isMimeTypeMatch("application/vnd.openxmlformats-officedocument.wordprocessingml.document", [
        "application/*",
      ]),
    ).toBe(true)
    expect(isMimeTypeMatch("application/vnd.ms-excel", ["application/vnd.ms-excel"])).toBe(true)
    expect(isMimeTypeMatch("text/html; charset=utf-8", ["text/*"])).toBe(true)
  })
})
