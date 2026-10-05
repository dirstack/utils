import { describe, expect, it } from "bun:test"
import {
  isEmptyObject,
  isKeyInObject,
  nullsToUndefined,
  omit,
  pick,
  pickFromObject,
  sortObject,
  sortObjectKeys,
} from "./objects"

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

  it("returns true for inherited properties", () => {
    const parent = { inherited: "value" }
    const child = Object.create(parent)
    child.own = "own property"
    expect(isKeyInObject("own", child)).toBe(true)
    expect(isKeyInObject("inherited", child)).toBe(true)
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
      // TypeScript should know that input[key] is valid here
      expect(input[key]).toBe("John")
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
    const input = { b: 2, a: 1, c: 3 }
    const sortedObj = sortObject(input)

    expect(sortedObj).toEqual({ a: 1, b: 2, c: 3 })
  })

  it("sorts the keys of an object using a custom comparator function", () => {
    const input = { b: 2, a: 1, c: 3 }
    const comparator = sortObjectKeys(["c", "b", "a"]) as (a: unknown, b: unknown) => number
    const sortedObj = sortObject(input, comparator)

    expect(sortedObj).toEqual({ c: 3, b: 2, a: 1 })
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
    // modern JS engines preserve insertion order for string keys
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

  it("should recurse into arrays and not mutate the input", () => {
    const input = { items: [{ value: null }, { value: "ok" }], tags: [null, "a"] }
    const result = nullsToUndefined(input)

    expect(result).toEqual({
      items: [{ value: undefined }, { value: "ok" }],
      tags: [undefined, "a"],
    })
    // Input is untouched
    expect(input.items[0]?.value).toBeNull()
    expect(input.tags[0]).toBeNull()
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

  it("should return non-plain objects such as Date as-is", () => {
    const date = new Date("2023-01-01")
    const result = nullsToUndefined(date)

    expect(result).toEqual(date)
    expect(result).toBe(date)
  })
})

describe("pickFromObject (deprecated alias)", () => {
  it("is an alias", () => {
    expect(pickFromObject).toBe(pick)
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
