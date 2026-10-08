import { describe, expect, it } from "vitest"
import { formatToDecimals } from "./decimals"

describe("formatToDecimals", () => {
  it("formats a number to the specified number of decimals", () => {
    expect(formatToDecimals(1234.5678, 2)).toEqual("1234.57")
    expect(formatToDecimals(1234.5678, 0)).toEqual("1235")
    expect(formatToDecimals(1234.5678, 4)).toEqual("1234.5678")
  })

  it("handles negative decimal values", () => {
    expect(formatToDecimals(1234.5678, -1)).toEqual("1235")
  })

  it("trims trailing double zeros", () => {
    expect(formatToDecimals(1234.0, 2)).toEqual("1234")
    expect(formatToDecimals(1234.0, 0)).toEqual("1234")
    expect(formatToDecimals(1234.1, 2)).toEqual("1234.10")
  })

  it("rounds half-way values as written", () => {
    expect(formatToDecimals(1.005, 2)).toEqual("1.01")
    expect(formatToDecimals(0.485, 2)).toEqual("0.49")
    expect(formatToDecimals(1.45, 1)).toEqual("1.5")
    expect(formatToDecimals(-3012.345, 2)).toEqual("-3012.35")
  })

  it("never returns negative zero", () => {
    expect(formatToDecimals(-0.001, 2)).toEqual("0")
    expect(formatToDecimals(-0.4)).toEqual("0")
    expect(formatToDecimals(-0)).toEqual("0")
  })

  it("keeps the plain form of non-finite numbers", () => {
    expect(formatToDecimals(Number.NaN, 2)).toEqual("NaN")
    expect(formatToDecimals(Number.POSITIVE_INFINITY, 2)).toEqual("Infinity")
    expect(formatToDecimals(Number.NEGATIVE_INFINITY, 2)).toEqual("-Infinity")
  })

  it("does not add thousands separators", () => {
    expect(formatToDecimals(1234567.891, 2)).toEqual("1234567.89")
    expect(formatToDecimals(1e21)).toEqual("1000000000000000000000")
  })
})
