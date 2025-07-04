import { describe, expect, it } from "bun:test"

import { addSearchParams, getCurrentPage, getPageLink } from "./params"

describe("addSearchParams", () => {
  it("adds a search parameter to a URL without any", () => {
    const url = "https://example.com"
    const params = { foo: "bar" }
    expect(addSearchParams(url, params)).toBe("https://example.com/?foo=bar")
  })

  it("adds a search parameter to a URL with existing ones", () => {
    const url = "https://example.com?a=1"
    const params = { b: "2" }
    expect(addSearchParams(url, params)).toBe("https://example.com/?a=1&b=2")
  })

  it("updates an existing search parameter", () => {
    const url = "https://example.com?a=1"
    const params = { a: "2" }
    expect(addSearchParams(url, params)).toBe("https://example.com/?a=2")
  })

  it("removes a search parameter when value is empty string", () => {
    const url = "https://example.com?a=1&b=2"
    const params = { b: "" }
    expect(addSearchParams(url, params)).toBe("https://example.com/?a=1")
  })

  it("handles multiple parameter updates and additions", () => {
    const url = "https://example.com?a=1&b=2"
    const params = { b: "3", c: "4" }
    expect(addSearchParams(url, params)).toBe("https://example.com/?a=1&b=3&c=4")
  })

  it("does not modify the URL if it does not start with http", () => {
    const url = "/some/path?a=1"
    const params = { b: "2" }
    expect(addSearchParams(url, params)).toBe("/some/path?a=1")
  })

  it("preserves the hash in the URL", () => {
    const url = "https://example.com?a=1#section"
    const params = { b: "2" }
    expect(addSearchParams(url, params)).toBe("https://example.com/?a=1&b=2#section")
  })
})

describe("getCurrentPage", () => {
  it("returns 1 if page is not provided", () => {
    const currentPage = getCurrentPage()

    expect(currentPage).toBe(1)
  })

  it("returns the provided page as a number", () => {
    const currentPage = getCurrentPage("2")

    expect(currentPage).toBe(2)
  })

  it("returns 1 if the provided page is not a number", () => {
    const currentPage = getCurrentPage("invalid")

    expect(currentPage).toBe(1)
  })

  it("returns 1 if the provided page is less than 1", () => {
    const currentPage = getCurrentPage("0")

    expect(currentPage).toBe(1)
  })
})

describe("getPageLink", () => {
  it("returns a link with the provided page", () => {
    const searchParams = new URLSearchParams("q=hello&sort=desc")
    const pathname = "/search"
    const page = 2
    const pageLink = getPageLink(searchParams, pathname, page)

    expect(pageLink).toBe("/search?q=hello&sort=desc&page=2")
  })
})
