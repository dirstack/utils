import { describe, expect, it, spyOn } from "bun:test"
import { formatCurrency, formatIntervalAmount, formatNumber, formatToDecimals } from "./format"

// Whitespace/separator characters Intl.NumberFormat inserts, shared across the currency tests.
const NBSP = "\u00A0" // Non-breaking space (thousands separator / after a currency code)
const NNBSP = "\u202F" // Narrow no-break space (French locale)
const SWISS_SEPARATOR = "'" // Swiss thousands separator, normalized to a plain apostrophe

// de-CH's grouping glyph varies by ICU build (U+2019 on full ICU, U+0027 on some Bun builds);
// normalize it so the assertion checks the formatting, not the glyph.
function normalizeApostrophe(value: string) {
  return value.replace(/’/g, "'")
}

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
        `1${NNBSP}234,56${NBSP}$`,
      )
    })

    it("formats currency with British locale (en-GB)", () => {
      expect(formatCurrency(1000, { currency: "GBP", locale: "en-GB" })).toBe("£1,000")
      expect(formatCurrency(1000.5, { currency: "GBP", locale: "en-GB" })).toBe("£1,000.50")
      expect(formatCurrency(1234.56, { currency: "USD", locale: "en-GB" })).toBe("$1,234.56")
    })

    it("formats currency with Spanish locale (es-ES)", () => {
      expect(formatCurrency(1000, { currency: "EUR", locale: "es-ES" })).toBe(`1000${NBSP}€`)
      expect(formatCurrency(1000.5, { currency: "EUR", locale: "es-ES" })).toBe(`1000,50${NBSP}€`)
      expect(formatCurrency(1234.56, { currency: "USD", locale: "es-ES" })).toBe(`1234,56${NBSP}$`)
    })

    it("formats currency with Canadian locale (en-CA)", () => {
      expect(formatCurrency(1000, { currency: "CAD", locale: "en-CA" })).toBe("$1,000")
      expect(formatCurrency(1000.5, { currency: "CAD", locale: "en-CA" })).toBe("$1,000.50")
      expect(formatCurrency(1234.56, { currency: "USD", locale: "en-CA" })).toBe("$1,234.56")
    })

    it("formats currency with Australian locale (en-AU)", () => {
      expect(formatCurrency(1000, { currency: "AUD", locale: "en-AU" })).toBe("$1,000")
      expect(formatCurrency(1000.5, { currency: "AUD", locale: "en-AU" })).toBe("$1,000.50")
      expect(formatCurrency(1234.56, { currency: "USD", locale: "en-AU" })).toBe("$1,234.56")
    })

    it("formats currency with Chinese locale (zh-CN)", () => {
      expect(formatCurrency(1000, { currency: "CNY", locale: "zh-CN" })).toBe("¥1,000")
      expect(formatCurrency(1000.5, { currency: "CNY", locale: "zh-CN" })).toBe("¥1,000.50")
      expect(formatCurrency(1234.56, { currency: "USD", locale: "zh-CN" })).toBe("$1,234.56")
    })

    it("formats currency with Swiss locale (de-CH)", () => {
      expect(normalizeApostrophe(formatCurrency(1000, { currency: "CHF", locale: "de-CH" }))).toBe(
        `CHF${NBSP}1${SWISS_SEPARATOR}000`,
      )
      expect(
        normalizeApostrophe(formatCurrency(1000.5, { currency: "CHF", locale: "de-CH" })),
      ).toBe(`CHF${NBSP}1${SWISS_SEPARATOR}000.50`)
      expect(
        normalizeApostrophe(formatCurrency(1234.56, { currency: "EUR", locale: "de-CH" })),
      ).toBe(`EUR${NBSP}1${SWISS_SEPARATOR}234.56`)
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

describe("formatter cache", () => {
  it("reuses a formatter for equal options in any key order", () => {
    const spy = spyOn(Intl, "NumberFormat")

    expect(formatNumber(1234.5, { locale: "de", maximumFractionDigits: 1 })).toBe("1.234,5")
    expect(formatNumber(1234.5, { maximumFractionDigits: 1, locale: "de" })).toBe("1.234,5")
    expect(spy).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })

  it("reuses the formatter behind formatCurrency", () => {
    formatCurrency(10, { currency: "JPY" })
    const spy = spyOn(Intl, "NumberFormat")

    expect(formatCurrency(1000, { currency: "JPY" })).toBe("¥1,000")
    expect(spy).not.toHaveBeenCalled()

    spy.mockRestore()
  })

  it("keeps separate formatters for different options", () => {
    expect(formatNumber(1234.5, { locale: "de" })).toBe("1.234,5")
    expect(formatNumber(1234.5, { locale: "en-US" })).toBe("1,234.5")
    expect(formatNumber(1234.5, { locale: "de" })).toBe("1.234,5")
  })
})
