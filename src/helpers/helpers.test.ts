import { describe, expect, it } from "bun:test"

import {
  convertNewlines,
  getExcerpt,
  getInitials,
  getShortcutLabel,
  isCuid,
  isTruthy,
  joinAsSentence,
  nullsToUndefined,
  range,
  slugify,
  splitArrayIntoChunks,
  stripHtml,
  tryCatch,
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

describe("splitArrayIntoChunks", () => {
  it("splits an array into chunks of specified size", () => {
    expect(splitArrayIntoChunks([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]])
    expect(splitArrayIntoChunks([1, 2, 3, 4, 5, 6], 5)).toEqual([[1, 2, 3, 4, 5], [6]])
    expect(splitArrayIntoChunks([], 3)).toEqual([])
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

describe("tryCatch", () => {
  it("should return data when promise resolves", async () => {
    const promise = Promise.resolve("success")
    const result = await tryCatch(promise)

    expect(result.data).toEqual("success")
    expect(result.error).toBeNull()
  })

  it("should return error when promise rejects", async () => {
    const error = new Error("failure")
    const promise = Promise.reject(error)
    const result = await tryCatch(promise)

    expect(result.data).toBeNull()
    expect(result.error).toEqual(error)
  })
})

describe("nullsToUndefined", () => {
  it("should convert null to undefined", () => {
    expect(nullsToUndefined(null)).toEqual(undefined)
  })

  it("should preserve undefined values", () => {
    expect(nullsToUndefined(undefined)).toEqual(undefined)
  })

  it("should preserve primitive values", () => {
    expect(nullsToUndefined("hello")).toEqual("hello")
    expect(nullsToUndefined(42)).toEqual(42)
    expect(nullsToUndefined(true)).toEqual(true)
    expect(nullsToUndefined(false)).toEqual(false)
    expect(nullsToUndefined(0)).toEqual(0)
  })

  it("should convert null properties in objects to undefined", () => {
    const input = {
      name: "John",
      age: null,
      active: true,
      description: null,
    }

    const result = nullsToUndefined(input)

    expect(result).toEqual({
      name: "John",
      age: undefined,
      active: true,
      description: undefined,
    })
  })

  it("should recursively convert null values in nested objects", () => {
    const input = {
      user: {
        name: "John",
        profile: {
          bio: null,
          avatar: "avatar.jpg",
          settings: {
            theme: null,
            notifications: true,
          },
        },
      },
      data: null,
    }

    const result = nullsToUndefined(input)

    expect(result).toEqual({
      user: {
        name: "John",
        profile: {
          bio: undefined,
          avatar: "avatar.jpg",
          settings: {
            theme: undefined,
            notifications: true,
          },
        },
      },
      data: undefined,
    })
  })

  it("should handle empty objects", () => {
    const input = {}
    const result = nullsToUndefined(input)
    expect(result).toEqual({})
  })

  it("should handle objects with only null values", () => {
    const input = {
      a: null,
      b: null,
      c: null,
    }

    const result = nullsToUndefined(input)

    expect(result).toEqual({
      a: undefined,
      b: undefined,
      c: undefined,
    })
  })

  it("should mutate the original object", () => {
    const input = {
      name: "John",
      age: null,
    }

    const result = nullsToUndefined(input)

    // Should return the same reference
    expect(result).toBe(input)
    // Original object should be mutated
    expect(input.age).toEqual(undefined)
  })

  it("should handle arrays (current behavior: not processed recursively)", () => {
    const input = [null, "hello", null, 42]
    const result = nullsToUndefined(input)

    // Arrays are not plain objects (constructor.name !== "Object"), so they're returned as-is
    expect(result).toEqual([null, "hello", null, 42])
    expect(result).toBe(input)
  })

  it("should handle Date objects (current behavior: processed as objects)", () => {
    const date = new Date("2023-01-01")
    const result = nullsToUndefined(date)

    // Date objects have constructor.name !== "Object", so they're returned as-is
    expect(result).toEqual(date)
    expect(result).toBe(date)
  })

  it("should handle objects containing arrays", () => {
    const input = {
      list: [null, "item", null],
      name: null,
    }

    const result = nullsToUndefined(input)

    expect(result).toEqual({
      list: [null, "item", null], // Array is not processed
      name: undefined, // Object property is processed
    })
  })

  it("should handle complex mixed data structures", () => {
    const input = {
      id: 1,
      name: null,
      metadata: {
        created: "2023-01-01",
        updated: null,
        tags: ["tag1", null, "tag2"],
        config: {
          enabled: null,
          value: 42,
        },
      },
      stats: null,
    }

    const result = nullsToUndefined(input)

    expect(result).toEqual({
      id: 1,
      name: undefined,
      metadata: {
        created: "2023-01-01",
        updated: undefined,
        tags: ["tag1", null, "tag2"], // Arrays not processed
        config: {
          enabled: undefined,
          value: 42,
        },
      },
      stats: undefined,
    })
  })
})
