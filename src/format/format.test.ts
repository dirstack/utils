import { describe, expect, it } from "bun:test"
import {
  formatBytes,
  formatCurrency,
  formatIntervalAmount,
  formatMimeType,
  formatNumber,
  formatToDecimals,
  isMimeTypeMatch,
} from "./format"

// Whitespace/separator characters Intl.NumberFormat inserts, shared across the currency tests.
const NBSP = "\u00A0" // Non-breaking space (thousands separator / after a currency code)
const NNBSP = "\u202F" // Narrow no-break space (French locale)
const SWISS_SEPARATOR = "'" // Apostrophe (Swiss thousands separator, Bun ICU)

describe("formatNumber", () => {
  it("formats numbers with standard notation (default)", () => {
    expect(formatNumber(1000)).toBe("1,000")
    expect(formatNumber(1000000)).toBe("1,000,000")
  })

  it("formats numbers with compact notation", () => {
    expect(formatNumber(1000, { notation: "compact" })).toBe("1K")
    expect(formatNumber(1500, { notation: "compact" })).toBe("1.5K")
    expect(formatNumber(1000000, { notation: "compact" })).toBe("1M")
  })

  it("formats numbers with different locales", () => {
    expect(formatNumber(1000, { notation: "compact", locale: "de-DE" })).toBe("1000")
  })

  it("passes through arbitrary Intl options", () => {
    expect(formatNumber(1234.5, { minimumFractionDigits: 2 })).toBe("1,234.50")
    expect(formatNumber(0.42, { style: "percent" })).toBe("42%")
  })

  it("formats large numbers", () => {
    expect(formatNumber(1000000000, { notation: "compact" })).toBe("1B")
    expect(formatNumber(1500000000, { notation: "compact" })).toBe("1.5B")
  })

  it("formats small numbers", () => {
    expect(formatNumber(0.1)).toBe("0.1")
    expect(formatNumber(0.01)).toBe("0.01")
  })

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0")
  })

  it("formats negative numbers", () => {
    expect(formatNumber(-1000, { notation: "compact" })).toBe("-1K")
    expect(formatNumber(-1500000, { notation: "compact" })).toBe("-1.5M")
  })
})

describe("formatCurrency", () => {
  it("formats a number as currency", () => {
    expect(formatCurrency(1000)).toBe("$1,000")
    expect(formatCurrency(1000.5)).toBe("$1,000.50")
    expect(formatCurrency(1000, { currency: "EUR" })).toBe("€1,000")
    expect(formatCurrency(1000.5, { currency: "EUR" })).toBe("€1,000.50")
  })

  it("strips trailing zero fractions across currency decimal counts", () => {
    // 2-decimal: strip whole, keep partial
    expect(formatCurrency(1000)).toBe("$1,000")
    expect(formatCurrency(1000.5)).toBe("$1,000.50")
    // 0-decimal currency (JPY) — no fraction to strip
    expect(formatCurrency(1500, { currency: "JPY" })).toBe("¥1,500")
    // 3-decimal currency (BHD) — strips all three zeros when whole, keeps them otherwise
    expect(formatCurrency(1000, { currency: "BHD", locale: "en-US" })).toBe(`BHD${NBSP}1,000`)
    expect(formatCurrency(1000.5, { currency: "BHD", locale: "en-US" })).toBe(`BHD${NBSP}1,000.500`)
  })

  it("forwards currency-specific Intl options", () => {
    expect(formatCurrency(1000, { currencyDisplay: "code" })).toBe(`USD${NBSP}1,000`)
    // callers can opt out of the trailing-zero stripping
    expect(formatCurrency(1000, { trailingZeroDisplay: "auto" })).toBe("$1,000.00")
  })

  describe("custom locales", () => {
    it("formats currency with German locale (de-DE)", () => {
      expect(formatCurrency(1000, { currency: "EUR", locale: "de-DE" })).toBe(`1.000${NBSP}€`)
      expect(formatCurrency(1000.5, { currency: "EUR", locale: "de-DE" })).toBe(`1.000,50${NBSP}€`)
      expect(formatCurrency(1234.56, { currency: "USD", locale: "de-DE" })).toBe(`1.234,56${NBSP}$`)
    })

    it("formats currency with French locale (fr-FR)", () => {
      expect(formatCurrency(1000, { currency: "EUR", locale: "fr-FR" })).toBe(
        `1${NNBSP}000${NBSP}€`,
      )
      expect(formatCurrency(1000.5, { currency: "EUR", locale: "fr-FR" })).toBe(
        `1${NNBSP}000,50${NBSP}€`,
      )
      expect(formatCurrency(1234.56, { currency: "USD", locale: "fr-FR" })).toBe(
        `1${NNBSP}234,56${NBSP}$US`,
      )
    })

    it("formats currency with British locale (en-GB)", () => {
      expect(formatCurrency(1000, { currency: "GBP", locale: "en-GB" })).toBe("£1,000")
      expect(formatCurrency(1000.5, { currency: "GBP", locale: "en-GB" })).toBe("£1,000.50")
      expect(formatCurrency(1234.56, { currency: "USD", locale: "en-GB" })).toBe("US$1,234.56")
    })

    it("formats currency with Spanish locale (es-ES)", () => {
      expect(formatCurrency(1000, { currency: "EUR", locale: "es-ES" })).toBe(`1000${NBSP}€`)
      expect(formatCurrency(1000.5, { currency: "EUR", locale: "es-ES" })).toBe(`1000,50${NBSP}€`)
      expect(formatCurrency(1234.56, { currency: "USD", locale: "es-ES" })).toBe(
        `1234,56${NBSP}US$`,
      )
    })

    it("formats currency with Canadian locale (en-CA)", () => {
      expect(formatCurrency(1000, { currency: "CAD", locale: "en-CA" })).toBe("$1,000")
      expect(formatCurrency(1000.5, { currency: "CAD", locale: "en-CA" })).toBe("$1,000.50")
      expect(formatCurrency(1234.56, { currency: "USD", locale: "en-CA" })).toBe("US$1,234.56")
    })

    it("formats currency with Australian locale (en-AU)", () => {
      expect(formatCurrency(1000, { currency: "AUD", locale: "en-AU" })).toBe("$1,000")
      expect(formatCurrency(1000.5, { currency: "AUD", locale: "en-AU" })).toBe("$1,000.50")
      expect(formatCurrency(1234.56, { currency: "USD", locale: "en-AU" })).toBe(
        `USD${NBSP}1,234.56`,
      )
    })

    it("formats currency with Chinese locale (zh-CN)", () => {
      expect(formatCurrency(1000, { currency: "CNY", locale: "zh-CN" })).toBe("¥1,000")
      expect(formatCurrency(1000.5, { currency: "CNY", locale: "zh-CN" })).toBe("¥1,000.50")
      expect(formatCurrency(1234.56, { currency: "USD", locale: "zh-CN" })).toBe("US$1,234.56")
    })

    it("formats currency with Swiss locale (de-CH)", () => {
      expect(formatCurrency(1000, { currency: "CHF", locale: "de-CH" })).toBe(
        `CHF${NBSP}1${SWISS_SEPARATOR}000`,
      )
      expect(formatCurrency(1000.5, { currency: "CHF", locale: "de-CH" })).toBe(
        `CHF${NBSP}1${SWISS_SEPARATOR}000.50`,
      )
      expect(formatCurrency(1234.56, { currency: "EUR", locale: "de-CH" })).toBe(
        `EUR${NBSP}1${SWISS_SEPARATOR}234.56`,
      )
    })

    it("handles zero amounts with different locales", () => {
      expect(formatCurrency(0, { currency: "USD", locale: "en-US" })).toBe("$0")
      expect(formatCurrency(0, { currency: "EUR", locale: "de-DE" })).toBe(`0${NBSP}€`)
      expect(formatCurrency(0, { currency: "GBP", locale: "en-GB" })).toBe("£0")
    })

    it("handles negative amounts with different locales", () => {
      expect(formatCurrency(-1000, { currency: "USD", locale: "en-US" })).toBe("-$1,000")
      expect(formatCurrency(-1000, { currency: "EUR", locale: "de-DE" })).toBe(`-1.000${NBSP}€`)
      expect(formatCurrency(-1000.5, { currency: "EUR", locale: "fr-FR" })).toBe(
        `-1${NNBSP}000,50${NBSP}€`,
      )
    })

    it("handles large amounts with different locales", () => {
      expect(formatCurrency(1000000, { currency: "USD", locale: "en-US" })).toBe("$1,000,000")
      expect(formatCurrency(1000000, { currency: "EUR", locale: "de-DE" })).toBe(
        `1.000.000${NBSP}€`,
      )
      expect(formatCurrency(1000000, { currency: "EUR", locale: "fr-FR" })).toBe(
        `1${NNBSP}000${NNBSP}000${NBSP}€`,
      )
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
})

describe("formatMimeType", () => {
  it("formats a MIME type string", () => {
    expect(formatMimeType("image/png")).toBe("PNG")
    expect(formatMimeType("application/json")).toBe("JSON")
    expect(formatMimeType("text/*")).toBeUndefined()
  })
})

describe("isMimeTypeMatch", () => {
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

  it("should be case sensitive", () => {
    expect(isMimeTypeMatch("Image/JPEG", ["image/jpeg"])).toBe(false)
    expect(isMimeTypeMatch("image/jpeg", ["Image/JPEG"])).toBe(false)
    expect(isMimeTypeMatch("IMAGE/JPEG", ["image/*"])).toBe(false)
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
