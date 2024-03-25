import { describe, expect, it } from "bun:test"

import {
  convertNewlines,
  getExcerpt,
  getInitials,
  getShortcutLabel,
  isCuid,
  isTruthy,
  range,
  slugify,
  splitArrayChunks,
  stripHtml,
} from "./helpers"

describe("range", () => {
  it("generates an array of numbers", () => {
    expect(range(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(range(0, 0)).toEqual([0])
    expect(range(-3, 3)).toEqual([-3, -2, -1, 0, 1, 2, 3])
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

describe("stripHtml", () => {
  it("strips html tags from a string", () => {
    expect(stripHtml("<p>Hello, <strong>world!</strong></p>")).toEqual("Hello, world!")
    expect(stripHtml("<div><h1>Header</h1><p>Paragraph</p></div>")).toEqual("HeaderParagraph")
    expect(stripHtml("")).toEqual("")
  })
})

describe("convertNewlines", () => {
  it("converts newlines to specified element", () => {
    expect(convertNewlines("Hello\nworld\n")).toEqual("Hello world ")
    expect(convertNewlines("Hello\nworld\n", "<br>")).toEqual("Hello<br>world<br>")
    expect(convertNewlines("")).toEqual("")
  })
})

describe("getExcerpt", () => {
  it("gets an excerpt from a string", () => {
    expect(getExcerpt("<p>Hello, <strong>world!</strong></p>", 10)).toEqual("Hello, wor...")
    expect(getExcerpt("Lorem ipsum dolor sit amet, consectetur adipiscing elit.", 20)).toEqual(
      "Lorem ipsum dolor si...",
    )
    expect(getExcerpt("", 10)).toEqual(null)
  })
})

describe("slugify", () => {
  it("should slugify the input string", () => {
    expect(slugify("HelloWorld")).toEqual("helloworld")
    expect(slugify("Hello World")).toEqual("hello-world")
    expect(slugify("HelloWorld", true)).toEqual("hello-world")
    expect(slugify("Lorem Ipsum Dolor Sit Amet")).toEqual("lorem-ipsum-dolor-sit-amet")
    expect(slugify("1234")).toEqual("1234")
    expect(slugify("")).toEqual("")
  })
})

describe("isCuid", () => {
  it("checks if a given string is a valid cuid", () => {
    expect(isCuid("clixluz61002mk9stbofhbkv6")).toEqual(true)
    expect(isCuid("abcdefghijklmnopqrstuwxyz")).toEqual(false)
    expect(isCuid("abcdefghijklmnopqrstuwxy")).toEqual(false)
    expect(isCuid("")).toEqual(false)
  })
})

describe("isTruthy", () => {
  it("checks if a value is truthy", () => {
    expect(isTruthy("hello")).toEqual(true)
    expect(isTruthy(0)).toEqual(false)
    expect(isTruthy(null)).toEqual(false)
    expect(isTruthy(undefined)).toEqual(false)
    expect(isTruthy(false)).toEqual(false)
  })
})

describe("getInitials", () => {
  it("should return empty string if value is undefined", () => {
    expect(getInitials(undefined)).toEqual("")
  })

  it("should return empty string if value is null", () => {
    expect(getInitials(null)).toEqual("")
  })

  it("should return empty string if value is an empty string", () => {
    expect(getInitials("")).toEqual("")
  })

  it("should return the initials of a single or two letters", () => {
    expect(getInitials("JD")).toEqual("JD")
  })

  it("should return the initials of a single name", () => {
    expect(getInitials("John")).toEqual("J")
  })

  it("should return the initials of two names", () => {
    expect(getInitials("John Doe")).toEqual("JD")
  })

  it("should return the initials of three names", () => {
    expect(getInitials("John Adam Doe")).toEqual("JAD")
  })

  it("should return the initials of four names", () => {
    expect(getInitials("John Adam Doe Smith")).toEqual("JADS")
  })

  it("should return the initials of two names with limit of 1", () => {
    expect(getInitials("John Doe", 1)).toEqual("J")
  })

  it("should return the initials of three names with limit of 2", () => {
    expect(getInitials("John Adam Doe", 2)).toEqual("JA")
  })

  it("should return the initials of two names with limit greater than the number of initials", () => {
    expect(getInitials("John Doe", 5)).toEqual("JD")
  })
})

describe("splitArrayChunks", () => {
  it("splits an array into chunks of specified size", () => {
    expect(splitArrayChunks([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]])
    expect(splitArrayChunks([1, 2, 3, 4, 5, 6], 5)).toEqual([[1, 2, 3, 4, 5], [6]])
    expect(splitArrayChunks([], 3)).toEqual([])
  })
})
