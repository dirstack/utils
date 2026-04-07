import { describe, expect, it } from "bun:test"
import { deserialize, maybeParseJson, maybeStringifyJson, serialize } from "./parsers"

describe("maybeParseJson", () => {
  it("parses a valid JSON string", () => {
    const jsonString = '{"name": "John", "age": 30}'
    const expected = { name: "John", age: 30 }

    expect(maybeParseJson(jsonString)).toMatchObject(expected)
  })

  it("returns the input value if it is not a valid JSON string", () => {
    const invalidJsonString = "not a valid JSON string"

    expect(maybeParseJson(invalidJsonString)).toEqual(invalidJsonString)
  })
})

describe("maybeStringifyJson", () => {
  it("stringifies an object", () => {
    const obj = { name: "John", age: 30 }
    const expected = '{"name":"John","age":30}'

    expect(maybeStringifyJson(obj)).toEqual(expected)
  })

  it("returns the input value if it is not an object", () => {
    const str = "not an object"

    expect(maybeStringifyJson(str)).toEqual(str)
  })

  it("returns undefined if the input value is undefined", () => {
    expect(maybeStringifyJson(undefined)).toBeUndefined()
  })
})

describe("serialize", () => {
  it("deep clones plain objects", () => {
    const obj = { a: 1, b: { c: 2 } }
    const result = serialize(obj)

    expect(result).toEqual(obj)
    expect(result).not.toBe(obj)
    expect(result.b).not.toBe(obj.b)
  })

  it("deep clones arrays", () => {
    const arr = [1, [2, 3], { a: 4 }]
    const result = serialize(arr)

    expect(result).toEqual(arr)
    expect(result).not.toBe(arr)
  })

  it("strips undefined values", () => {
    const result = serialize({ a: 1, b: undefined })

    expect(result).toEqual({ a: 1 })
    expect("b" in result).toBe(false)
  })

  it("strips functions", () => {
    const result = serialize({ a: 1, fn: () => {} })

    expect(result).toEqual({ a: 1 })
    expect("fn" in result).toBe(false)
  })

  it("converts Date to ISO string", () => {
    const result = serialize({ d: new Date("2025-01-15T12:00:00.000Z") })

    expect(result.d).toBe("2025-01-15T12:00:00.000Z")
  })

  it("handles null values", () => {
    const result = serialize({ a: null, b: 1 })

    expect(result).toEqual({ a: null, b: 1 })
  })

  it("handles nested objects and arrays", () => {
    const obj = { users: [{ name: "John", scores: [1, 2] }] }
    const result = serialize(obj)

    expect(result).toEqual(obj)
    expect(result.users[0].scores).not.toBe(obj.users[0].scores)
  })
})

describe("deserialize", () => {
  it("parses a JSON string into an object", () => {
    const json = '{"name":"John","age":30}'
    const result = deserialize<{ name: string; age: number }>(json)

    expect(result).toEqual({ name: "John", age: 30 })
  })

  it("parses a JSON array", () => {
    const json = "[1,2,3]"
    const result = deserialize<number[]>(json)

    expect(result).toEqual([1, 2, 3])
  })

  it("parses primitive JSON values", () => {
    expect(deserialize<string>('"hello"')).toBe("hello")
    expect(deserialize<number>("42")).toBe(42)
    expect(deserialize<boolean>("true")).toBe(true)
    expect(deserialize<null>("null")).toBeNull()
  })

  it("parses nested structures", () => {
    const json = '{"users":[{"name":"John","tags":["admin"]}]}'
    const result = deserialize<{ users: { name: string; tags: string[] }[] }>(json)

    expect(result.users[0].name).toBe("John")
    expect(result.users[0].tags).toEqual(["admin"])
  })

  it("throws on invalid JSON", () => {
    expect(() => deserialize("not json")).toThrow()
  })
})
