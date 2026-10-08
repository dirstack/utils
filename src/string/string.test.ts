import { describe, expect, it, test } from "vitest"
import { getInitials, joinAsSentence, lcFirst, slugify, truncate, ucFirst } from "./string"

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

describe("truncate", () => {
  it("returns text that fits unchanged", () => {
    expect(truncate("The quick brown fox", 20)).toBe("The quick brown fox")
    expect(truncate("The quick brown fox", 19)).toBe("The quick brown fox")
  })

  it("cuts after the last whole word and adds an ellipsis", () => {
    expect(truncate("The quick brown fox jumps", 15)).toBe("The quick…")
  })

  it("keeps a word that ends exactly at the cut", () => {
    expect(truncate("The quick brown fox", 10)).toBe("The quick…")
  })

  it("cuts mid-word when wordBoundary is false", () => {
    expect(truncate("The quick brown fox jumps", 15, { wordBoundary: false })).toBe(
      "The quick brow…",
    )
  })

  it("cuts a single word that is longer than the limit", () => {
    expect(truncate("Supercalifragilistic", 10)).toBe("Supercali…")
  })

  it("never returns more characters than the length", () => {
    const text = "Open source alternatives to popular software, curated by the community."
    for (let length = 0; length <= text.length; length++) {
      expect([...new Intl.Segmenter().segment(truncate(text, length))].length).toBeLessThanOrEqual(
        length,
      )
    }
  })

  it("does not split emoji", () => {
    expect(truncate("😀😀😀😀", 3)).toBe("😀😀…")
    expect(truncate("👨‍👩‍👧 family photo", 2)).toBe("👨‍👩‍👧…")
  })

  it("collapses whitespace and newlines", () => {
    expect(truncate("Hello\n\n  world\t!", 20)).toBe("Hello world !")
  })

  it("drops punctuation left before the ellipsis", () => {
    expect(truncate("Hello, world and more", 8)).toBe("Hello…")
  })

  it("runs in linear time on long runs of punctuation", () => {
    const start = performance.now()
    truncate(`${",".repeat(20_000)}yz`, 20_001, { wordBoundary: false })
    expect(performance.now() - start).toBeLessThan(100)
  })

  it("keeps a less-than sign and the text after it", () => {
    expect(truncate("5 < 6 and 7 > 3", 20)).toBe("5 < 6 and 7 > 3")
  })

  it("uses a custom ellipsis within the length", () => {
    expect(truncate("The quick brown fox", 12, { ellipsis: "..." })).toBe("The quick...")
  })

  it("returns an empty string for empty input", () => {
    expect(truncate("", 10)).toBe("")
    expect(truncate(null, 10)).toBe("")
    expect(truncate(undefined, 10)).toBe("")
  })

  it("shortens the ellipsis itself when the length leaves no room for text", () => {
    expect(truncate("The quick brown fox", 0)).toBe("")
    expect(truncate("The quick brown fox", 2, { ellipsis: "..." })).toBe("..")
  })
})

describe("slugify", () => {
  it("should slugify the input string", () => {
    expect(slugify("HelloWorld")).toEqual("helloworld")
    expect(slugify("Hello World")).toEqual("hello-world")
    expect(slugify("HelloWorld", { decamelize: true })).toEqual("hello-world")
    expect(slugify("Lorem Ipsum Dolor Sit Amet")).toEqual("lorem-ipsum-dolor-sit-amet")
    expect(slugify("1234")).toEqual("1234")
    expect(slugify("")).toEqual("")
  })

  it("should slugify the input string with custom replacements", () => {
    expect(slugify("Hello+World")).toEqual("helloplusworld")
    expect(slugify("Hello#World")).toEqual("hellosharpworld")
    expect(slugify("Hello+World", { decamelize: true })).toEqual("helloplus-world")
    expect(slugify("Hello#World", { decamelize: true })).toEqual("hellosharp-world")
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
