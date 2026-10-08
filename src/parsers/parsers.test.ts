import { describe, expect, it } from "vitest"
import { serialize } from "./parsers"

describe("serialize", () => {
  it("returns undefined for values JSON cannot represent", () => {
    expect(serialize(undefined)).toBeUndefined()
    expect(serialize(() => 1)).toBeUndefined()
  })

  it("turns dates into ISO strings", () => {
    expect(serialize({ at: new Date("2026-10-05T00:00:00Z") })).toEqual({
      at: "2026-10-05T00:00:00.000Z",
    })
  })

  it("deep clones plain objects", () => {
    const input = { a: 1, b: { c: 2 } }
    const result = serialize(input)

    expect(result).toEqual(input)
    expect(result).not.toBe(input)
    expect(result.b).not.toBe(input.b)
  })

  it("deep clones arrays", () => {
    const arr = [1, [2, 3], { a: 4 }]
    const result = serialize(arr)

    expect(result).toEqual(arr)
    expect(result).not.toBe(arr)
  })

  it("strips undefined values", () => {
    const result = serialize({ a: 1, b: undefined } as Record<string, unknown>)

    expect(result).toEqual({ a: 1 })
    expect("b" in result).toBe(false)
  })

  it("strips functions", () => {
    const result = serialize({ a: 1, fn: () => {} } as Record<string, unknown>)

    expect(result).toEqual({ a: 1 })
    expect("fn" in result).toBe(false)
  })

  it("converts Date to ISO string", () => {
    const result = serialize({ d: new Date("2025-01-15T12:00:00.000Z") })

    expect(result.d as unknown).toBe("2025-01-15T12:00:00.000Z")
  })

  it("handles null values", () => {
    const result = serialize({ a: null, b: 1 })

    expect(result).toEqual({ a: null, b: 1 })
  })

  it("handles nested objects and arrays", () => {
    const input = { users: [{ name: "John", scores: [1, 2] }] }
    const result = serialize(input)

    expect(result).toEqual(input)
    expect(result.users[0]?.scores).not.toBe(input.users[0]?.scores)
  })
})
