import { describe, expect, it } from "bun:test"
import { maybeParseJson, maybeStringifyJson } from "./parsers"

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
