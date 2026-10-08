import { afterEach, describe, expect, it, mock, spyOn } from "bun:test"
import {
  getRandomColor,
  getRandomDigits,
  getRandomElement,
  getRandomNumber,
  getRandomProperty,
  getRandomString,
} from "./random"

afterEach(() => {
  mock.restore()
})

/**
 * Makes `crypto.getRandomValues` return `bytes`, then zeros.
 */
function mockRandomBytes(bytes: number[]) {
  spyOn(crypto, "getRandomValues").mockImplementation(<T extends ArrayBufferView>(array: T) => {
    const target = array as unknown as Uint8Array
    target.set(bytes.slice(0, target.length))
    return array
  })
}

describe("getRandomColor", () => {
  it("returns a string", () => {
    const result = getRandomColor()
    expect(typeof result).toBe("string")
  })

  it("returns a string with length 6", () => {
    const result = getRandomColor()
    expect(result.length).toBe(6)
  })

  it("returns a different string each time it is called", () => {
    const result1 = getRandomColor()
    const result2 = getRandomColor()
    expect(result1).not.toBe(result2)
  })
})

describe("getRandomString", () => {
  it("returns a string", () => {
    const result = getRandomString()
    expect(typeof result).toBe("string")
  })

  it("returns a string with default length of 16", () => {
    const result = getRandomString()
    expect(result.length).toBe(16)
  })

  it("returns a string with specified length", () => {
    const result = getRandomString(10)
    expect(result.length).toBe(10)
  })

  it("returns different strings on each call", () => {
    const result1 = getRandomString()
    const result2 = getRandomString()
    expect(result1).not.toBe(result2)
  })

  it("contains only alphanumeric characters", () => {
    const result = getRandomString()
    expect(result).toMatch(/^[a-zA-Z0-9]+$/)
  })

  it("returns an empty string for a length of 0", () => {
    expect(getRandomString(0)).toBe("")
  })

  it("fills lengths longer than one getRandomValues call", () => {
    expect(getRandomString(100_000)).toMatch(/^[a-zA-Z0-9]{100000}$/)
  })

  it("discards bytes that would bias the result", () => {
    // 62 characters: bytes 248 and above are discarded, the rest map to `byte % 62`
    mockRandomBytes([255, 248, 0, 61, 62, 237])
    expect(getRandomString(4)).toBe("a9aZ")
  })
})

describe("getRandomNumber", () => {
  it("returns a random number within the specified range", () => {
    const min = 1
    const max = 10
    const randomNumber = getRandomNumber(min, max)
    expect(randomNumber).toBeGreaterThanOrEqual(min)
    expect(randomNumber).toBeLessThanOrEqual(max)
  })
})

describe("getRandomDigits", () => {
  it("discards bytes that would bias the result", () => {
    // 10 digits: bytes 250 and above are discarded, the rest map to `byte % 10`
    mockRandomBytes([250, 255, 9, 19, 249])
    expect(getRandomDigits(3)).toBe("999")
  })

  it("returns a string", () => {
    const result = getRandomDigits(5)
    expect(typeof result).toBe("string")
  })

  it("returns a string with specified length", () => {
    const result = getRandomDigits(10)
    expect(result.length).toBe(10)
  })

  it("returns different strings on each call", () => {
    const result1 = getRandomDigits(5)
    const result2 = getRandomDigits(5)
    expect(result1).not.toBe(result2)
  })

  it("contains only digits", () => {
    const result = getRandomDigits(10)
    expect(result).toMatch(/^[0-9]+$/)
  })

  it("handles different lengths", () => {
    const short = getRandomDigits(1)
    const long = getRandomDigits(20)
    expect(short.length).toBe(1)
    expect(long.length).toBe(20)
  })
})

describe("getRandomElement", () => {
  it("accepts a readonly array", () => {
    const sizes = ["small", "large"] as const
    expect(sizes).toContain(getRandomElement(sizes)!)
  })

  it("returns a value from the array", () => {
    const array = [1, 2, 3]
    const result = getRandomElement(array)
    expect(result).toBeOneOf([1, 2, 3])
  })
})

describe("getRandomProperty", () => {
  it("returns a value from the object", () => {
    const input = { a: 1, b: 2, c: 3 }
    const result = getRandomProperty(input)
    expect(result).toBeOneOf([1, 2, 3])
  })
})
