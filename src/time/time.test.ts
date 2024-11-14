import { describe, expect, it } from "bun:test"

import {
  formatDate,
  formatDateOrTime,
  formatDateRange,
  formatDateTime,
  formatTime,
  getReadTime,
} from "./time"

const timestamp = "2022-01-01 00:00:00.000"

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
    expect(formatDateTime(timestamp)).toInclude("Jan 1, 2022")
    expect(formatDateTime(timestamp)).toInclude("2:00 AM")
  })
})

describe("formatDateOrTime", () => {
  it("formats date correctly", () => {
    expect(formatDateOrTime(timestamp, "date")).toEqual("Jan 1, 2022")
  })

  it("formats time correctly", () => {
    expect(formatDateOrTime(timestamp, "time")).toEqual("12:00 AM")
  })

  it("formats date and time correctly", () => {
    expect(formatDateOrTime(timestamp, "datetime")).toInclude("Jan 1, 2022")
    expect(formatDateOrTime(timestamp, "datetime")).toInclude("2:00 AM")
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
    const start = "2022-01-01"
    const end = "2022-12-31"
    expect(formatDateRange(start, end)).toBe("Jan 1 – Dec 31, 2022")
  })

  it("formats date range correctly with different locale", () => {
    const start = "2022-01-01"
    const end = "2022-12-31"
    expect(formatDateRange(start, end, "medium", "es")).toBe("1 ene – 31 dic 2022")
  })

  it("formats date range with short date style", () => {
    const start = "2022-01-01"
    const end = "2022-12-31"
    expect(formatDateRange(start, end, "short")).toBe("1/1/22 – 12/31/22")
  })

  it("formats date range with long date style", () => {
    const start = "2022-01-01"
    const end = "2022-12-31"
    expect(formatDateRange(start, end, "long")).toBe("January 1 – December 31, 2022")
  })

  it("handles same day range", () => {
    const date = "2022-01-01"
    expect(formatDateRange(date, date)).toBe("Jan 1, 2022")
  })
})
