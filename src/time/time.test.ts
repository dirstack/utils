import { describe, expect, it, vi } from "vitest"
import {
  DAY_MS,
  DAY_SECONDS,
  dayIn,
  dayKey,
  formatDate,
  formatDateRange,
  formatDateTime,
  formatTime,
  fromUnix,
  getReadTime,
  HOUR_MS,
  HOUR_SECONDS,
  MINUTE_MS,
  MINUTE_SECONDS,
  SECOND_MS,
  shiftDayKey,
  toUnix,
} from "./time"

// Local time without a zone, so calls below without a `timeZone` give the same output in every TZ
const timestamp = "2022-01-01 00:00:00.000"

// Near midnight UTC: the date differs between UTC and zones far from it
const lateUtc = "2026-10-05T23:30:00Z"
const earlyUtc = "2026-10-05T00:30:00Z"

// ICU versions differ on some separators: macOS joins medium date and time with " at " and
// spaces range dashes, the ICU bundled with Linux Bun uses ", " and an unspaced dash, and
// Node.js puts thin spaces (U+2009) around the dash. `\s` matches all of these spaces.
const dateTimeJoin = "(,| at)"
const rangeDash = "\\s?–\\s?"

/**
 * Matches a formatted range of `start` and `end` with any of the dash spacings above.
 */
function range(start: string, end: string) {
  return new RegExp(`^${start}${rangeDash}${end}$`)
}

describe("formatDate", () => {
  it("formats date correctly", () => {
    expect(formatDate(timestamp)).toEqual("Jan 1, 2022")
  })
})

describe("formatTime", () => {
  it("formats time correctly", () => {
    expect(formatTime(timestamp)).toEqual("12:00 AM")
  })
})

describe("formatDateTime", () => {
  it("formats date and time correctly", () => {
    expect(formatDateTime(timestamp)).toContain("Jan 1, 2022")
    expect(formatDateTime(timestamp)).toContain("2:00 AM")
  })
})

describe("getReadTime", () => {
  it("calculates read time correctly", () => {
    const content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    expect(getReadTime(content)).toEqual(1)
  })

  it("returns 0 for empty content", () => {
    expect(getReadTime(null)).toEqual(0)
  })
})

describe("formatDateRange", () => {
  it("formats date range correctly in English", () => {
    const start = "2022-01-01T00:00:00"
    const end = "2022-12-31T00:00:00"
    expect(formatDateRange(start, end)).toMatch(range("Jan 1", "Dec 31, 2022"))
  })

  it("formats date range correctly with different locale", () => {
    const start = "2022-01-01T00:00:00"
    const end = "2022-12-31T00:00:00"
    expect(formatDateRange(start, end, { locale: "es" })).toMatch(range("1 ene", "31 dic 2022"))
  })

  it("formats date range with short date style", () => {
    const start = "2022-01-01T00:00:00"
    const end = "2022-12-31T00:00:00"
    expect(formatDateRange(start, end, { dateStyle: "short" })).toMatch(range("1/1/22", "12/31/22"))
  })

  it("formats date range with long date style", () => {
    const start = "2022-01-01T00:00:00"
    const end = "2022-12-31T00:00:00"
    expect(formatDateRange(start, end, { dateStyle: "long" })).toMatch(
      range("January 1", "December 31, 2022"),
    )
  })

  it("handles same day range", () => {
    const date = "2022-01-01T00:00:00"
    expect(formatDateRange(date, date)).toBe("Jan 1, 2022")
  })
})

describe("options object", () => {
  describe("timeZone", () => {
    it("formats dates in UTC near midnight", () => {
      expect(formatDate(lateUtc, { timeZone: "UTC" })).toBe("Oct 5, 2026")
      expect(formatDate(earlyUtc, { timeZone: "UTC" })).toBe("Oct 5, 2026")
    })

    it("formats times in UTC near midnight", () => {
      expect(formatTime(lateUtc, { timeZone: "UTC" })).toBe("11:30 PM")
      expect(formatTime(earlyUtc, { timeZone: "UTC" })).toBe("12:30 AM")
    })

    it("formats date and time in UTC near midnight", () => {
      expect(formatDateTime(lateUtc, { timeZone: "UTC" })).toMatch(
        new RegExp(`^Oct 5, 2026${dateTimeJoin} 11:30 PM$`),
      )
      expect(formatDateTime(earlyUtc, { timeZone: "UTC" })).toMatch(
        new RegExp(`^Oct 5, 2026${dateTimeJoin} 12:30 AM$`),
      )
    })

    it("formats date-only strings as the same calendar day", () => {
      expect(formatDate("2026-10-05", { timeZone: "UTC" })).toBe("Oct 5, 2026")
    })

    it("formats in a non-UTC time zone", () => {
      expect(formatDate(lateUtc, { timeZone: "Asia/Tokyo" })).toBe("Oct 6, 2026")
      expect(formatTime(lateUtc, { timeZone: "Asia/Tokyo" })).toBe("8:30 AM")
      expect(formatDate(earlyUtc, { timeZone: "America/Los_Angeles" })).toBe("Oct 4, 2026")
    })
  })

  describe("defaults", () => {
    it("keeps the default styles when only a time zone is set", () => {
      expect(formatDate(lateUtc, {})).toBe(formatDate(lateUtc))
      expect(formatTime(lateUtc, {})).toBe(formatTime(lateUtc))
      expect(formatDateTime(lateUtc, {})).toBe(formatDateTime(lateUtc))
    })

    it("fills in the missing style for formatDateTime", () => {
      expect(formatDateTime(lateUtc, { dateStyle: "long", timeZone: "UTC" })).toBe(
        "October 5, 2026 at 11:30 PM",
      )
    })

    it("treats undefined style options as missing", () => {
      expect(formatDate(lateUtc, { dateStyle: undefined, timeZone: "UTC" })).toBe("Oct 5, 2026")
    })
  })

  describe("Intl options", () => {
    it("formats with dateStyle and locale", () => {
      expect(formatDate(lateUtc, { dateStyle: "long", timeZone: "UTC", locale: "en-GB" })).toBe(
        "5 October 2026",
      )
    })

    it("formats with individual date fields", () => {
      const options = { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" } as const
      expect(formatDate("2026-10-05", { ...options, locale: "en-GB" })).toBe("05 Oct 2026")
      expect(formatDate(lateUtc, { weekday: "long", timeZone: "UTC" })).toBe("Monday")
    })

    it("formats with individual time fields", () => {
      const options = { hour: "2-digit", minute: "2-digit", hourCycle: "h23" } as const
      expect(formatTime(lateUtc, { ...options, timeZone: "UTC" })).toBe("23:30")
    })

    it("formats with both style presets", () => {
      const options = { dateStyle: "short", timeStyle: "long", timeZone: "UTC" } as const
      expect(formatDateTime(lateUtc, options)).toBe("10/5/26, 11:30:00 PM UTC")
    })

    it("formats with a non-default locale", () => {
      expect(formatDate(lateUtc, { timeZone: "UTC", locale: "pl" })).toBe("5 paź 2026")
    })
  })

  describe("formatDateRange", () => {
    it("formats a range in a fixed time zone", () => {
      expect(formatDateRange("2026-10-05", "2026-10-09", { timeZone: "UTC" })).toMatch(
        range("Oct 5", "9, 2026"),
      )
      expect(formatDateRange(earlyUtc, lateUtc, { timeZone: "UTC" })).toBe("Oct 5, 2026")
    })

    it("formats a range with locale and individual fields", () => {
      const options = { timeZone: "UTC", locale: "es" }
      expect(formatDateRange("2026-10-05", "2026-10-09", options)).toMatch(range("5", "9 oct 2026"))

      const fields = { day: "numeric", month: "short", timeZone: "UTC" } as const
      expect(formatDateRange("2026-10-05", "2026-11-09", fields)).toMatch(range("Oct 5", "Nov 9"))
    })
  })

  describe("formatter cache", () => {
    it("returns the same output on repeated calls", () => {
      const options = { day: "2-digit", month: "short", timeZone: "UTC" } as const
      const first = formatDate(lateUtc, options)

      expect(formatDate(lateUtc, options)).toBe(first)
      expect(formatDate(lateUtc, { ...options })).toBe(first)
    })

    it("reuses a formatter for equal options in any key order", () => {
      const spy = vi.spyOn(Intl, "DateTimeFormat")

      expect(formatDate(lateUtc, { timeZone: "Europe/Warsaw", locale: "de" })).toBe("06.10.2026")
      expect(formatDate(lateUtc, { locale: "de", timeZone: "Europe/Warsaw" })).toBe("06.10.2026")
      expect(spy).toHaveBeenCalledTimes(1)

      spy.mockRestore()
    })

    it("evicts the oldest formatter once the cache is full", () => {
      const options = { timeZone: "UTC", locale: "en-x-evict0" }
      formatDate(lateUtc, options)

      const spy = vi.spyOn(Intl, "DateTimeFormat")

      for (let index = 1; index <= 100; index++) {
        expect(formatDate(lateUtc, { ...options, locale: `en-x-evict${index}` })).toBe(
          "Oct 5, 2026",
        )
      }

      expect(formatDate(lateUtc, options)).toBe("Oct 5, 2026")
      expect(spy).toHaveBeenCalledTimes(101)

      spy.mockRestore()
    })

    it("keeps separate formatters for different options", () => {
      expect(formatTime(lateUtc, { timeZone: "UTC" })).toBe("11:30 PM")
      expect(formatTime(lateUtc, { timeZone: "Asia/Tokyo" })).toBe("8:30 AM")
      expect(formatTime(lateUtc, { timeZone: "UTC" })).toBe("11:30 PM")
    })
  })
})

describe("fromUnix and toUnix", () => {
  it("convert between dates and Unix seconds", () => {
    expect(fromUnix(1_759_708_800).toISOString()).toBe("2025-10-06T00:00:00.000Z")
    expect(toUnix("2025-10-06T00:00:00.750Z")).toBe(1_759_708_800)
  })
})

describe("dayKey", () => {
  it("names the UTC day", () => {
    expect(dayKey(lateUtc)).toBe("2026-10-05")
    expect(dayKey(new Date(earlyUtc))).toBe("2026-10-05")
  })
})

describe("shiftDayKey", () => {
  it("moves across month, year and leap-day boundaries", () => {
    expect(shiftDayKey("2026-09-30", 1)).toBe("2026-10-01")
    expect(shiftDayKey("2027-01-01", -1)).toBe("2026-12-31")
    expect(shiftDayKey("2028-02-28", 1)).toBe("2028-02-29")
    expect(shiftDayKey("2026-03-01", -30)).toBe("2026-01-30")
  })
})

describe("dayIn", () => {
  it("names the day on the given clock", () => {
    expect(dayIn(lateUtc, "Asia/Tokyo")).toBe("2026-10-06")
    expect(dayIn(lateUtc, "America/New_York")).toBe("2026-10-05")
    expect(dayIn(earlyUtc, "America/Los_Angeles")).toBe("2026-10-04")
  })

  it("keeps the day across a daylight-saving change", () => {
    expect(dayIn("2026-03-29T01:30:00Z", "Europe/Warsaw")).toBe("2026-03-29")
  })
})

describe("time constants", () => {
  it("agree with each other", () => {
    expect(DAY_MS).toBe(24 * HOUR_MS)
    expect(HOUR_MS).toBe(60 * MINUTE_MS)
    expect(MINUTE_MS).toBe(60 * SECOND_MS)
    expect(DAY_SECONDS * 1000).toBe(DAY_MS)
    expect(HOUR_SECONDS * 1000).toBe(HOUR_MS)
    expect(MINUTE_SECONDS * SECOND_MS).toBe(MINUTE_MS)
    expect(HOUR_SECONDS).toBe(60 * MINUTE_SECONDS)
  })
})
