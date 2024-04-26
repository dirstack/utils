import { describe, expect, it } from "bun:test"

import { keepNumberInRange, parseNumericValue, preciseRound } from "./numbers"

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
    expect(parseNumericValue("not a number")).toBe(undefined)
  })
})

describe("preciseRound", () => {
  it("rounds to 2 decimal places by default", () => {
    expect(preciseRound(2.345)).toEqual(2.35)
  })

  it("rounds to specified decimal places", () => {
    expect(preciseRound(2.34567, 3)).toEqual(2.346)
  })

  it("handles rounding up at 0.5 exactly", () => {
    expect(preciseRound(2.005, 2)).toEqual(2.01)
  })

  it("handles negative numbers", () => {
    expect(preciseRound(-2.345)).toEqual(-2.34)
  })

  it("rounds to 0 decimal places correctly", () => {
    expect(preciseRound(2.5, 0)).toEqual(3)
  })

  it("trims the number of decimal places if the value is an integer", () => {
    expect(preciseRound(2.0000003, 2)).toEqual(2)
  })
})
