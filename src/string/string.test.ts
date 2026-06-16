import { describe, expect, it, test } from "bun:test"
import {
  convertNewlines,
  getExcerpt,
  getInitials,
  isCuid,
  joinAsSentence,
  lcFirst,
  slugify,
  stripHtml,
  ucFirst,
} from "./string"

describe("ucFirst", () => {
  test("should uppercase the first character of a string", () => {
    expect(ucFirst("hello")).toBe("Hello")
    expect(ucFirst("world")).toBe("World")
  })

  test("should handle empty strings", () => {
    expect(ucFirst("")).toBe("")
  })

  test("should handle single character strings", () => {
    expect(ucFirst("a")).toBe("A")
    expect(ucFirst("z")).toBe("Z")
  })

  test("should handle non-string inputs", () => {
    expect(ucFirst(null as any)).toBe("")
    expect(ucFirst(undefined as any)).toBe("")
    expect(ucFirst(123 as any)).toBe("")
  })

  test("should preserve the rest of the string", () => {
    expect(ucFirst("hello world")).toBe("Hello world")
    expect(ucFirst("HELLO")).toBe("HELLO")
  })
})

describe("lcFirst", () => {
  test("should lowercase the first character of a string", () => {
    expect(lcFirst("Hello")).toBe("hello")
    expect(lcFirst("World")).toBe("world")
  })

  test("should handle empty strings", () => {
    expect(lcFirst("")).toBe("")
  })

  test("should handle single character strings", () => {
    expect(lcFirst("A")).toBe("a")
    expect(lcFirst("Z")).toBe("z")
  })

  test("should handle non-string inputs", () => {
    expect(lcFirst(null as any)).toBe("")
    expect(lcFirst(undefined as any)).toBe("")
    expect(lcFirst(123 as any)).toBe("")
  })

  test("should preserve the rest of the string", () => {
    expect(lcFirst("Hello World")).toBe("hello World")
    expect(lcFirst("hello")).toBe("hello")
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

  it("should slugify the input string with custom replacements", () => {
    expect(slugify("Hello+World")).toEqual("helloplusworld")
    expect(slugify("Hello#World")).toEqual("hellosharpworld")
    expect(slugify("Hello+World", true)).toEqual("helloplus-world")
    expect(slugify("Hello#World", true)).toEqual("hellosharp-world")
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

describe("joinAsSentence", () => {
  it("joins an array of strings into a sentence", () => {
    expect(joinAsSentence(["apple"])).toEqual("apple")
    expect(joinAsSentence(["apple", "banana"])).toEqual("apple and banana")
    expect(joinAsSentence(["apple", "banana", "cherry"])).toEqual("apple, banana and cherry")
  })

  it("joins an array of strings into a sentence with a custom last item", () => {
    expect(joinAsSentence(["apple", "banana", "cherry"], undefined, "or")).toEqual(
      "apple, banana or cherry",
    )
  })

  it("joins an array with custom max items", () => {
    expect(joinAsSentence(["apple", "banana", "cherry"], 2)).toEqual("apple and banana")
  })
})
