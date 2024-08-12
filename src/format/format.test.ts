import { describe, expect, it } from "bun:test"

import {
  formatBytes,
  formatCurrency,
  formatIntervalAmount,
  formatMimeType,
  formatNumber,
  formatToDecimals,
} from "./format"

describe("formatNumber", () => {
  it("formats numbers with compact notation (default)", () => {
    expect(formatNumber(1000)).toBe("1K")
    expect(formatNumber(1500)).toBe("1.5K")
    expect(formatNumber(1000000)).toBe("1M")
  })

  it("formats numbers with standard notation", () => {
    expect(formatNumber(1000, "standard")).toBe("1,000")
    expect(formatNumber(1000000, "standard")).toBe("1,000,000")
  })

  it("formats numbers with different locales", () => {
    expect(formatNumber(1000, "compact", "de-DE")).toBe("1000")
  })

  it("formats large numbers", () => {
    expect(formatNumber(1000000000)).toBe("1B")
    expect(formatNumber(1500000000)).toBe("1.5B")
  })

  it("formats small numbers", () => {
    expect(formatNumber(0.1)).toBe("0.1")
    expect(formatNumber(0.01)).toBe("0.01")
  })

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0")
  })

  it("formats negative numbers", () => {
    expect(formatNumber(-1000)).toBe("-1K")
    expect(formatNumber(-1500000)).toBe("-1.5M")
  })
})

describe("formatCurrency", () => {
  it("formats a number as currency", () => {
    expect(formatCurrency(1000)).toBe("$1,000")
    expect(formatCurrency(1000.5)).toBe("$1,000.50")
    expect(formatCurrency(1000, "EUR")).toBe("€1,000")
    expect(formatCurrency(1000.5, "EUR")).toBe("€1,000.50")
  })
})

describe("formatIntervalAmount", () => {
  it("formats the amount for a monthly interval by default", () => {
    expect(formatIntervalAmount(1000)).toEqual("1000")
    expect(formatIntervalAmount(1234.5678)).toEqual("1234.57")
  })

  it("formats the amount for a yearly interval", () => {
    expect(formatIntervalAmount(1000, "year")).toEqual("83.33")
    expect(formatIntervalAmount(1234.5678, "year")).toEqual("102.88")
  })
})

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
})

describe("formatBytes", () => {
  it("formats bytes correctly", () => {
    expect(formatBytes(0)).toEqual("0 Bytes")
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
})

describe("formatMimeType", () => {
  it("formats a MIME type string", () => {
    expect(formatMimeType("image/png")).toBe("PNG")
    expect(formatMimeType("application/json")).toBe("JSON")
    expect(formatMimeType("text/*")).toBeUndefined()
  })
})
