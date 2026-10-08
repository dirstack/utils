import { describe, expect, it } from "vitest"
import { isEmptyObject, isKeyInObject, omit, pick } from "./objects"

describe("isEmptyObject", () => {
  it("returns true for an empty object", () => {
    expect(isEmptyObject({})).toBe(true)
  })

  it("returns false for null, undefined and other non-objects", () => {
    expect(isEmptyObject(undefined)).toBe(false)
    expect(isEmptyObject(null)).toBe(false)
    expect(isEmptyObject("")).toBe(false)
    expect(isEmptyObject(0)).toBe(false)
  })

  it("returns false for arrays and class instances", () => {
    expect(isEmptyObject([])).toBe(false)
    expect(isEmptyObject(new Date())).toBe(false)
    expect(isEmptyObject(new Map())).toBe(false)
  })

  it("returns false for an object with properties", () => {
    expect(isEmptyObject({ a: 1 })).toBe(false)
  })

  it("returns true for an empty null-prototype object", () => {
    expect(isEmptyObject(Object.create(null))).toBe(true)
  })
})

describe("isKeyInObject", () => {
  it("returns true when string key exists in object", () => {
    const input = { name: "John", age: 30 }
    expect(isKeyInObject("name", input)).toBe(true)
    expect(isKeyInObject("age", input)).toBe(true)
  })

  it("ignores keys inherited from Object.prototype", () => {
    const prefixes = { user: "usr", team: "team" }
    expect(isKeyInObject("toString", prefixes)).toBe(false)
    expect(isKeyInObject("constructor", prefixes)).toBe(false)
  })

  it("returns false when string key does not exist in object", () => {
    const input = { name: "John", age: 30 }
    expect(isKeyInObject("email", input)).toBe(false)
    expect(isKeyInObject("phone", input)).toBe(false)
  })

  it("returns true when number key exists in object", () => {
    const input = { 0: "first", 1: "second", 42: "answer" }
    expect(isKeyInObject(0, input)).toBe(true)
    expect(isKeyInObject(1, input)).toBe(true)
    expect(isKeyInObject(42, input)).toBe(true)
  })

  it("returns false when number key does not exist in object", () => {
    const input = { 0: "first", 1: "second" }
    expect(isKeyInObject(2, input)).toBe(false)
    expect(isKeyInObject(99, input)).toBe(false)
  })

  it("returns true when symbol key exists in object", () => {
    const sym1 = Symbol("test1")
    const sym2 = Symbol("test2")
    const input = { [sym1]: "value1", [sym2]: "value2", regular: "normal" }
    expect(isKeyInObject(sym1, input)).toBe(true)
    expect(isKeyInObject(sym2, input)).toBe(true)
  })

  it("returns false when symbol key does not exist in object", () => {
    const sym1 = Symbol("test1")
    const sym2 = Symbol("test2")
    const input = { [sym1]: "value1", regular: "normal" }
    expect(isKeyInObject(sym2, input)).toBe(false)
  })

  it("works with mixed property types", () => {
    const sym = Symbol("mixed")
    const input = {
      stringKey: "string",
      42: "number",
      [sym]: "symbol",
      true: "boolean as key",
    }
    expect(isKeyInObject("stringKey", input)).toBe(true)
    expect(isKeyInObject(42, input)).toBe(true)
    expect(isKeyInObject(sym, input)).toBe(true)
    expect(isKeyInObject("true", input)).toBe(true)
    expect(isKeyInObject("missing", input)).toBe(false)
  })

  it("returns false for properties inherited through the prototype chain", () => {
    const parent = { inherited: "value" }
    const child = Object.create(parent)
    child.own = "own property"
    expect(isKeyInObject("own", child)).toBe(true)
    expect(isKeyInObject("inherited", child)).toBe(false)
  })

  it("handles empty objects", () => {
    const input = {}
    expect(isKeyInObject("anyKey", input)).toBe(false)
    expect(isKeyInObject(0, input)).toBe(false)
    expect(isKeyInObject(Symbol("any"), input)).toBe(false)
  })

  it("handles objects with undefined values", () => {
    const input = { undefinedValue: undefined, nullValue: null, defined: "value" }
    expect(isKeyInObject("undefinedValue", input)).toBe(true)
    expect(isKeyInObject("nullValue", input)).toBe(true)
    expect(isKeyInObject("defined", input)).toBe(true)
    expect(isKeyInObject("missing", input)).toBe(false)
  })

  it("provides proper type narrowing", () => {
    const input = { name: "John", age: 30 }
    const key: string = "name"

    if (isKeyInObject(key, input)) {
      // TypeScript should know that input[key] is valid here.
      expect(input[key]).toBe("John")
    } else {
      throw new Error("This should not happen")
    }
  })
})

describe("pick", () => {
  it("picks specified properties from an object", () => {
    const user = { id: 1, name: "John", email: "john@example.com", password: "secret" }
    const result = pick(user, ["id", "name", "email"])

    expect(result).toEqual({ id: 1, name: "John", email: "john@example.com" })
  })

  it("returns an empty object when given an empty keys array", () => {
    const user = { id: 1, name: "John", email: "john@example.com" }
    const result = pick(user, [])

    expect(result).toEqual({})
  })

  it("handles non-existing keys gracefully", () => {
    const user = { id: 1, name: "John" }
    const result = pick(user, ["id", "age" as keyof typeof user])

    expect(result).toEqual({ id: 1 } as typeof result)
  })

  it("picks properties with different data types", () => {
    const data = {
      str: "hello",
      num: 42,
      bool: true,
      arr: [1, 2, 3],
      input: { nested: "value" },
      nil: null,
      undef: undefined,
    }
    const result = pick(data, ["str", "num", "bool", "arr", "input"])

    expect(result).toEqual({
      str: "hello",
      num: 42,
      bool: true,
      arr: [1, 2, 3],
      input: { nested: "value" },
    })
  })

  it("handles an empty source object", () => {
    const emptyObj = {}
    const result = pick(emptyObj, ["nonExistent" as keyof typeof emptyObj])

    expect(result).toEqual({})
  })

  it("picks a single property", () => {
    const user = { id: 1, name: "John", email: "john@example.com" }
    const result = pick(user, ["name"])

    expect(result).toEqual({ name: "John" })
  })

  it("handles objects with symbol keys", () => {
    const sym = Symbol("test")
    const input = { [sym]: "symbol value", regular: "regular value" }
    const result = pick(input, ["regular"])

    expect(result).toEqual({ regular: "regular value" })
  })

  it("preserves property order", () => {
    const input = { c: 3, a: 1, b: 2 }
    const result = pick(input, ["a", "b", "c"])

    // While object property order isn't guaranteed in all cases,
    // modern JS engines preserve insertion order for string keys.
    expect(Object.keys(result)).toEqual(["a", "b", "c"])
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it("works with readonly keys array", () => {
    const user = { id: 1, name: "John", email: "john@example.com" }
    const keys = ["id", "name"] as const
    const result = pick(user, keys)

    expect(result).toEqual({ id: 1, name: "John" })
  })

  it("handles falsy values correctly", () => {
    const data = {
      zero: 0,
      emptyString: "",
      false: false,
      nullValue: null,
      undefinedValue: undefined,
    }
    const result = pick(data, ["zero", "emptyString", "false", "nullValue"])

    expect(result).toEqual({
      zero: 0,
      emptyString: "",
      false: false,
      nullValue: null,
    })
  })
})

describe("omit", () => {
  it("removes the specified properties from an object", () => {
    const user = { id: 1, name: "John", password: "secret" }
    const result = omit(user, ["password"])

    expect(result).toEqual({ id: 1, name: "John" })
  })

  it("returns a shallow copy when no keys are removed", () => {
    const user = { id: 1, name: "John" }
    const result = omit(user, [])

    expect(result).toEqual(user)
    expect(result).not.toBe(user)
  })

  it("ignores keys that are not present", () => {
    const user = { id: 1, name: "John" }
    const result = omit(user, ["missing" as keyof typeof user])

    expect(result).toEqual({ id: 1, name: "John" })
  })

  it("does not mutate the source object", () => {
    const user = { id: 1, name: "John", password: "secret" }
    omit(user, ["password"])

    expect(user).toEqual({ id: 1, name: "John", password: "secret" })
  })
})
