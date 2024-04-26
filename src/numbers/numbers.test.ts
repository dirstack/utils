import { describe, expect, it } from "bun:test"

import { getRandomNumber, keepNumberInRange, parseNumericValue } from "./numbers"

describe("keepNumberInRange", () => {
  it("returns the same value if no range is specified", () => {
    expect(keepNumberInRange(5)).toBe(5)
  })

  it("returns the minimum value if the value is less than the minimum", () => {
    expect(keepNumberInRange(3, 5)).toBe(5)
  })

  it("returns the maximum value if the value is greater than the maximum", () => {
    expect(keepNumberInRange(7, undefined, 5)).toBe(5)
  })

  it("returns the value if it is within the specified range", () => {
    expect(keepNumberInRange(3, 1, 5)).toBe(3)
  })

  it("returns the minimum value if the value is equal to the minimum", () => {
    expect(keepNumberInRange(5, 5, 10)).toBe(5)
  })

  it("returns the maximum value if the value is equal to the maximum", () => {
    expect(keepNumberInRange(10, 5, 10)).toBe(10)
  })
})

describe("parseNumericValue", () => {
  it("parses a string into a number", () => {
    expect(parseNumericValue("5")).toBe(5)
  })

  it("returns the original string if it cannot be parsed", () => {
    expect(parseNumericValue("not a number")).toBe("not a number")
  })
})
