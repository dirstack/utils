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

  describe("custom locales", () => {
    // Non-breaking space character used by Intl.NumberFormat
    const NBSP = "\u00A0"
    // Narrow no-break space used by French locale
    const NNBSP = "\u202F"

    it("formats currency with German locale (de-DE)", () => {
      expect(formatCurrency(1000, "EUR", "de-DE")).toBe(`1.000${NBSP}€`)
      expect(formatCurrency(1000.5, "EUR", "de-DE")).toBe(`1.000,50${NBSP}€`)
      expect(formatCurrency(1234.56, "USD", "de-DE")).toBe(`1.234,56${NBSP}$`)
    })

    it("formats currency with French locale (fr-FR)", () => {
      expect(formatCurrency(1000, "EUR", "fr-FR")).toBe(`1${NNBSP}000${NBSP}€`)
      expect(formatCurrency(1000.5, "EUR", "fr-FR")).toBe(`1${NNBSP}000,50${NBSP}€`)
      expect(formatCurrency(1234.56, "USD", "fr-FR")).toBe(`1${NNBSP}234,56${NBSP}$US`)
    })

    it("formats currency with British locale (en-GB)", () => {
      expect(formatCurrency(1000, "GBP", "en-GB")).toBe("£1,000")
      expect(formatCurrency(1000.5, "GBP", "en-GB")).toBe("£1,000.50")
      expect(formatCurrency(1234.56, "USD", "en-GB")).toBe("US$1,234.56")
    })

    it("formats currency with Spanish locale (es-ES)", () => {
      expect(formatCurrency(1000, "EUR", "es-ES")).toBe(`1000${NBSP}€`)
      expect(formatCurrency(1000.5, "EUR", "es-ES")).toBe(`1000,50${NBSP}€`)
      expect(formatCurrency(1234.56, "USD", "es-ES")).toBe(`1234,56${NBSP}US$`)
    })

    it("formats currency with Canadian locale (en-CA)", () => {
      expect(formatCurrency(1000, "CAD", "en-CA")).toBe("$1,000")
      expect(formatCurrency(1000.5, "CAD", "en-CA")).toBe("$1,000.50")
      expect(formatCurrency(1234.56, "USD", "en-CA")).toBe("US$1,234.56")
    })

    it("formats currency with Australian locale (en-AU)", () => {
      expect(formatCurrency(1000, "AUD", "en-AU")).toBe("$1,000")
      expect(formatCurrency(1000.5, "AUD", "en-AU")).toBe("$1,000.50")
      expect(formatCurrency(1234.56, "USD", "en-AU")).toBe(`USD${NBSP}1,234.56`)
    })

    it("formats currency with Chinese locale (zh-CN)", () => {
      expect(formatCurrency(1000, "CNY", "zh-CN")).toBe("¥1,000")
      expect(formatCurrency(1000.5, "CNY", "zh-CN")).toBe("¥1,000.50")
      expect(formatCurrency(1234.56, "USD", "zh-CN")).toBe("US$1,234.56")
    })

    it("formats currency with Swiss locale (de-CH)", () => {
      // Swiss locale uses U+2019 (right single quotation mark) as thousands separator
      const swissSeparator = "\u2019"
      expect(formatCurrency(1000, "CHF", "de-CH")).toBe(`CHF${NBSP}1${swissSeparator}000`)
      expect(formatCurrency(1000.5, "CHF", "de-CH")).toBe(`CHF${NBSP}1${swissSeparator}000.50`)
      expect(formatCurrency(1234.56, "EUR", "de-CH")).toBe(`EUR${NBSP}1${swissSeparator}234.56`)
    })

    it("handles zero amounts with different locales", () => {
      expect(formatCurrency(0, "USD", "en-US")).toBe("$0")
      expect(formatCurrency(0, "EUR", "de-DE")).toBe(`0${NBSP}€`)
      expect(formatCurrency(0, "GBP", "en-GB")).toBe("£0")
    })

    it("handles negative amounts with different locales", () => {
      expect(formatCurrency(-1000, "USD", "en-US")).toBe("-$1,000")
      expect(formatCurrency(-1000, "EUR", "de-DE")).toBe(`-1.000${NBSP}€`)
      expect(formatCurrency(-1000.5, "EUR", "fr-FR")).toBe(`-1${NNBSP}000,50${NBSP}€`)
    })

    it("handles large amounts with different locales", () => {
      expect(formatCurrency(1000000, "USD", "en-US")).toBe("$1,000,000")
      expect(formatCurrency(1000000, "EUR", "de-DE")).toBe(`1.000.000${NBSP}€`)
      expect(formatCurrency(1000000, "EUR", "fr-FR")).toBe(`1${NNBSP}000${NNBSP}000${NBSP}€`)
    })
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
    expect(formatBytes(0)).toEqual("0 KB")
    expect(formatBytes(512)).toEqual("0 KB")
    expect(formatBytes(512, 1)).toEqual("0.5 KB")
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
