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
    expect(ucFirst(null as never)).toBe("")
    expect(ucFirst(undefined as never)).toBe("")
    expect(ucFirst(123 as never)).toBe("")
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
    expect(lcFirst(null as never)).toBe("")
    expect(lcFirst(undefined as never)).toBe("")
    expect(lcFirst(123 as never)).toBe("")
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
  it("returns an empty string for no items", () => {
    expect(joinAsSentence([])).toBe("")
  })

  it("returns a single item as is", () => {
    expect(joinAsSentence(["apple"])).toBe("apple")
  })

  it("joins two items without a comma", () => {
    expect(joinAsSentence(["apple", "banana"])).toBe("apple and banana")
  })

  it("joins three or more items with a serial comma in en-US", () => {
    expect(joinAsSentence(["apple", "banana", "cherry"])).toBe("apple, banana, and cherry")
    expect(joinAsSentence(["apple", "banana", "cherry", "date", "elderberry"])).toBe(
      "apple, banana, cherry, date, and elderberry",
    )
  })

  it("leaves out the serial comma in en-GB", () => {
    expect(joinAsSentence(["apple", "banana", "cherry"], { locale: "en-GB" })).toBe(
      "apple, banana and cherry",
    )
  })

  it("keeps an item that contains a comma whole", () => {
    expect(joinAsSentence(["Paris", "Austin, Texas"])).toBe("Paris and Austin, Texas")
  })

  it("treats replacement patterns in items literally", () => {
    expect(joinAsSentence(["$&", "$1"])).toBe("$& and $1")
  })

  it("joins with 'or' for a disjunction", () => {
    expect(joinAsSentence(["apple", "banana", "cherry"], { type: "disjunction" })).toBe(
      "apple, banana, or cherry",
    )
  })

  it("uses the words and punctuation of the locale", () => {
    expect(joinAsSentence(["a", "b", "c"], { locale: "de" })).toBe("a, b und c")
    expect(joinAsSentence(["a", "b", "c"], { locale: "de", type: "disjunction" })).toBe(
      "a, b oder c",
    )
  })

  it("collapses the items past the limit into one trailing item", () => {
    expect(joinAsSentence(["a", "b", "c", "d"], { limit: 2 })).toBe("a, b, and 2 more")
    expect(joinAsSentence(["a", "b", "c", "d", "e"], { limit: 3, locale: "en-GB" })).toBe(
      "a, b, c and 2 more",
    )
  })

  it("shows the last item instead of hiding exactly one", () => {
    expect(joinAsSentence(["a", "b", "c"], { limit: 2 })).toBe("a, b, and c")
  })

  it("ignores a limit the list does not reach", () => {
    expect(joinAsSentence(["a", "b"], { limit: 5 })).toBe("a and b")
  })

  it("collapses every item for a limit of 0", () => {
    expect(joinAsSentence(["a", "b", "c"], { limit: 0 })).toBe("3 more")
  })

  it("labels the collapsed rest with formatRest", () => {
    expect(
      joinAsSentence(["a", "b", "c", "d"], {
        limit: 1,
        locale: "de",
        formatRest: count => `${count} weitere`,
      }),
    ).toBe("a und 3 weitere")
  })

  it("accepts a readonly array", () => {
    const fruits = ["apple", "banana"] as const
    expect(joinAsSentence(fruits)).toBe("apple and banana")
  })
})
