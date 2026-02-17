import { describe, expect, it } from "bun:test"
import { isEmptyObject, isKeyInObject, pickFromObject, sortObject, sortObjectKeys } from "./objects"

describe("isEmptyObject", () => {
  it("returns true for an empty object", () => {
    expect(isEmptyObject({})).toBe(true)
  })

  it("returns true for an object with no properties", () => {
    expect(isEmptyObject()).toBe(true)
  })

  it("returns false for an object with properties", () => {
    expect(isEmptyObject({ a: 1 })).toBe(false)
  })
})

describe("isKeyInObject", () => {
  it("returns true when string key exists in object", () => {
    const obj = { name: "John", age: 30 }
    expect(isKeyInObject("name", obj)).toBe(true)
    expect(isKeyInObject("age", obj)).toBe(true)
  })

  it("returns false when string key does not exist in object", () => {
    const obj = { name: "John", age: 30 }
    expect(isKeyInObject("email", obj)).toBe(false)
    expect(isKeyInObject("phone", obj)).toBe(false)
  })

  it("returns true when number key exists in object", () => {
    const obj = { 0: "first", 1: "second", 42: "answer" }
    expect(isKeyInObject(0, obj)).toBe(true)
    expect(isKeyInObject(1, obj)).toBe(true)
    expect(isKeyInObject(42, obj)).toBe(true)
  })

  it("returns false when number key does not exist in object", () => {
    const obj = { 0: "first", 1: "second" }
    expect(isKeyInObject(2, obj)).toBe(false)
    expect(isKeyInObject(99, obj)).toBe(false)
  })

  it("returns true when symbol key exists in object", () => {
    const sym1 = Symbol("test1")
    const sym2 = Symbol("test2")
    const obj = { [sym1]: "value1", [sym2]: "value2", regular: "normal" }
    expect(isKeyInObject(sym1, obj)).toBe(true)
    expect(isKeyInObject(sym2, obj)).toBe(true)
  })

  it("returns false when symbol key does not exist in object", () => {
    const sym1 = Symbol("test1")
    const sym2 = Symbol("test2")
    const obj = { [sym1]: "value1", regular: "normal" }
    expect(isKeyInObject(sym2, obj)).toBe(false)
  })

  it("works with mixed property types", () => {
    const sym = Symbol("mixed")
    const obj = {
      stringKey: "string",
      42: "number",
      [sym]: "symbol",
      true: "boolean as key",
    }
    expect(isKeyInObject("stringKey", obj)).toBe(true)
    expect(isKeyInObject(42, obj)).toBe(true)
    expect(isKeyInObject(sym, obj)).toBe(true)
    expect(isKeyInObject("true", obj)).toBe(true)
    expect(isKeyInObject("missing", obj)).toBe(false)
  })

  it("returns true for inherited properties", () => {
    const parent = { inherited: "value" }
    const child = Object.create(parent)
    child.own = "own property"
    expect(isKeyInObject("own", child)).toBe(true)
    expect(isKeyInObject("inherited", child)).toBe(true)
  })

  it("handles empty objects", () => {
    const obj = {}
    expect(isKeyInObject("anyKey", obj)).toBe(false)
    expect(isKeyInObject(0, obj)).toBe(false)
    expect(isKeyInObject(Symbol("any"), obj)).toBe(false)
  })

  it("handles objects with undefined values", () => {
    const obj = { undefinedValue: undefined, nullValue: null, defined: "value" }
    expect(isKeyInObject("undefinedValue", obj)).toBe(true)
    expect(isKeyInObject("nullValue", obj)).toBe(true)
    expect(isKeyInObject("defined", obj)).toBe(true)
    expect(isKeyInObject("missing", obj)).toBe(false)
  })

  it("provides proper type narrowing", () => {
    const obj = { name: "John", age: 30 }
    const key: string = "name"

    if (isKeyInObject(key, obj)) {
      // TypeScript should know that obj[key] is valid here
      expect(obj[key]).toBe("John")
    } else {
      throw new Error("This should not happen")
    }
  })
})

describe("sortObjectKeys", () => {
  const comparator = sortObjectKeys(["a", "b", "c"])

  it("returns 0 when both objects are not in the keys array", () => {
    const a = { d: 1 }
    const b = { e: 2 }
    expect(comparator(a, b)).toBe(0)
  })

  it("returns 1 when only the first object is not in the keys array", () => {
    const a = { d: 1 }
    const b = { a: 2 }
    expect(comparator(a, b)).toBe(1)
  })

  it("returns -1 when only the second object is not in the keys array", () => {
    const a = { b: 1 }
    const b = { d: 2 }
    expect(comparator(a, b)).toBe(-1)
  })

  it("returns a negative number when the first object is before the second object in the keys array", () => {
    const a = { b: 1 }
    const b = { c: 2 }
    expect(comparator(a, b)).toBeLessThan(0)
  })

  it("returns a positive number when the first object is after the second object in the keys array", () => {
    const a = { c: 1 }
    const b = { b: 2 }
    expect(comparator(a, b)).toBeGreaterThan(0)
  })

  it("returns 0 when both objects are in the same position in the keys array", () => {
    const a = { b: 1 }
    const b = { b: 2 }
    expect(comparator(a, b)).toBe(0)
  })
})

describe("sortObject", () => {
  it("sorts the keys of an object in alphabetical order", () => {
    const obj = { b: 2, a: 1, c: 3 }
    const sortedObj = sortObject(obj)

    expect(sortedObj).toEqual({ a: 1, b: 2, c: 3 })
  })

  it("sorts the keys of an object using a custom comparator function", () => {
    const obj = { b: 2, a: 1, c: 3 }
    const comparator = sortObjectKeys(["c", "b", "a"]) as (a: unknown, b: unknown) => number
    const sortedObj = sortObject(obj, comparator)

    expect(sortedObj).toEqual({ c: 3, b: 2, a: 1 })
  })
})

describe("pickFromObject", () => {
  it("picks specified properties from an object", () => {
    const user = { id: 1, name: "John", email: "john@example.com", password: "secret" }
    const result = pickFromObject(user, ["id", "name", "email"])

    expect(result).toEqual({ id: 1, name: "John", email: "john@example.com" })
  })

  it("returns an empty object when given an empty keys array", () => {
    const user = { id: 1, name: "John", email: "john@example.com" }
    const result = pickFromObject(user, [])

    expect(result).toEqual({})
  })

  it("handles non-existing keys gracefully", () => {
    const user = { id: 1, name: "John" }
    const result = pickFromObject(user, ["id", "age" as keyof typeof user])

    expect(result).toEqual({ id: 1 } as any)
  })

  it("picks properties with different data types", () => {
    const data = {
      str: "hello",
      num: 42,
      bool: true,
      arr: [1, 2, 3],
      obj: { nested: "value" },
      nil: null,
      undef: undefined,
    }
    const result = pickFromObject(data, ["str", "num", "bool", "arr", "obj"])

    expect(result).toEqual({
      str: "hello",
      num: 42,
      bool: true,
      arr: [1, 2, 3],
      obj: { nested: "value" },
    })
  })

  it("handles an empty source object", () => {
    const emptyObj = {}
    const result = pickFromObject(emptyObj, ["nonExistent" as keyof typeof emptyObj])

    expect(result).toEqual({})
  })

  it("picks a single property", () => {
    const user = { id: 1, name: "John", email: "john@example.com" }
    const result = pickFromObject(user, ["name"])

    expect(result).toEqual({ name: "John" })
  })

  it("handles objects with symbol keys", () => {
    const sym = Symbol("test")
    const obj = { [sym]: "symbol value", regular: "regular value" }
    const result = pickFromObject(obj, ["regular"])

    expect(result).toEqual({ regular: "regular value" })
  })

  it("preserves property order", () => {
    const obj = { c: 3, a: 1, b: 2 }
    const result = pickFromObject(obj, ["a", "b", "c"])

    // While object property order isn't guaranteed in all cases,
    // modern JS engines preserve insertion order for string keys
    expect(Object.keys(result)).toEqual(["a", "b", "c"])
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it("works with readonly keys array", () => {
    const user = { id: 1, name: "John", email: "john@example.com" }
    const keys = ["id", "name"] as const
    const result = pickFromObject(user, keys)

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
    const result = pickFromObject(data, ["zero", "emptyString", "false", "nullValue"])

    expect(result).toEqual({
      zero: 0,
      emptyString: "",
      false: false,
      nullValue: null,
    })
  })
})
