import { describe, expect, it } from "bun:test"
import { getCurrentPage, getPageLink } from "./pagination"

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

  it("drops the page param when page is 1", () => {
    const searchParams = new URLSearchParams("q=hello&sort=desc")
    const pageLink = getPageLink(searchParams, "/search", 1)

    expect(pageLink).toBe("/search?q=hello&sort=desc")
  })

  it("returns the bare pathname when page is 1 and no other params", () => {
    const searchParams = new URLSearchParams()
    const pageLink = getPageLink(searchParams, "/search", 1)

    expect(pageLink).toBe("/search")
  })

  it("removes an existing page param when page is 1", () => {
    const searchParams = new URLSearchParams("page=3&q=hello")
    const pageLink = getPageLink(searchParams, "/search", 1)

    expect(pageLink).toBe("/search?q=hello")
  })
})
