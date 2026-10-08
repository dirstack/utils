import { describe, expect, it } from "vitest"
import {
  getBalancedColumns,
  getCurrentPage,
  getPageLink,
  getShortcutLabel,
  isLightColor,
} from "./ui"

describe("getBalancedColumns", () => {
  it("prefers a column count that divides evenly", () => {
    expect(getBalancedColumns(12, 5, 6)).toBe(6)
    expect(getBalancedColumns(10, 5, 6)).toBe(5)
    expect(getBalancedColumns(15, 5, 6)).toBe(5)
    expect(getBalancedColumns(14, 6, 7)).toBe(7)
  })

  it("otherwise minimizes empty slots in the last row", () => {
    // 11 in 6 cols leaves 1 empty slot, in 5 cols it leaves 4
    expect(getBalancedColumns(11, 5, 6)).toBe(6)
    expect(getBalancedColumns(16, 6, 7)).toBe(6)
  })

  it("breaks ties toward more columns, so fewer rows", () => {
    expect(getBalancedColumns(30, 5, 6)).toBe(6)
  })

  it("handles fewer items than a full row", () => {
    expect(getBalancedColumns(4, 5, 6)).toBe(5)
    expect(getBalancedColumns(6, 5, 6)).toBe(6)
  })
})

describe("getShortcutLabel", () => {
  it("returns the uppercase key if metaKey is not provided", () => {
    expect(getShortcutLabel({ key: "a" })).toEqual("A")
    expect(getShortcutLabel({ key: "z" })).toEqual("Z")
  })

  it("returns the uppercase key with metaKey symbol if metaKey is true", () => {
    expect(getShortcutLabel({ key: "a", metaKey: true })).toEqual("⌘A")
    expect(getShortcutLabel({ key: "z", metaKey: true })).toEqual("⌘Z")
  })

  it("returns the uppercase key without metaKey symbol if metaKey is false", () => {
    expect(getShortcutLabel({ key: "a", metaKey: false })).toEqual("A")
    expect(getShortcutLabel({ key: "z", metaKey: false })).toEqual("Z")
  })
})

describe("isLightColor", () => {
  // Basic cases
  it("should identify white as light", () => {
    expect(isLightColor("#FFFFFF")).toBe(true)
  })

  it("should identify black as dark", () => {
    expect(isLightColor("#000000")).toBe(false)
  })

  // Edge cases
  it("should handle hex without #", () => {
    expect(isLightColor("FFFFFF")).toBe(true)
    expect(isLightColor("000000")).toBe(false)
  })

  it("should handle different hex case formats", () => {
    expect(isLightColor("#ffffff")).toBe(true)
    expect(isLightColor("#FFFFFF")).toBe(true)
    expect(isLightColor("#fFfFfF")).toBe(true)
  })

  // Trimming cases
  it("should trim longer hex strings", () => {
    expect(isLightColor("#FFFFFF00")).toBe(true) // Should trim off the alpha
    expect(isLightColor("#000000FF")).toBe(false) // Should trim off the alpha
    expect(isLightColor("#FF0000AABBCC")).toBe(false) // Should only use first 6 chars
  })

  // Borderline cases
  it("should handle colors near the brightness threshold", () => {
    expect(isLightColor("#BBBBBB")).toBe(true) // Just above threshold
    expect(isLightColor("#999999")).toBe(false) // Just below threshold
  })

  // Complex colors
  it("should correctly evaluate complex colors", () => {
    expect(isLightColor("#FF0000")).toBe(false) // Pure red (dark)
    expect(isLightColor("#00FF00")).toBe(false) // Pure green (dark)
    expect(isLightColor("#0000FF")).toBe(false) // Pure blue (dark)
    expect(isLightColor("#FF69B4")).toBe(false) // Hot pink (dark)
    expect(isLightColor("#800080")).toBe(false) // Purple (dark)
    expect(isLightColor("#87CEEB")).toBe(true) // Sky blue (light)
    expect(isLightColor("#98FB98")).toBe(true) // Pale green (light)
    expect(isLightColor("#800000")).toBe(false) // Maroon (dark)
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

  it("returns 1 for values that pass the number check but do not parse", () => {
    expect(getCurrentPage("  ")).toBe(1)
    expect(getCurrentPage(".5")).toBe(1)
  })

  it("returns the integer part of a decimal page", () => {
    expect(getCurrentPage("2.7")).toBe(2)
  })
})

describe("getPageLink", () => {
  it("does not modify the search params passed in", () => {
    const searchParams = new URLSearchParams("q=hello&page=3")

    expect(getPageLink(searchParams, "/search", 2)).toBe("/search?q=hello&page=2")
    expect(getPageLink(searchParams, "/search", 1)).toBe("/search?q=hello")
    expect(searchParams.toString()).toBe("q=hello&page=3")
  })

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
