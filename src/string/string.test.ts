import { describe, expect, test } from "bun:test"
import { lcFirst, ucFirst } from "./string"

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
