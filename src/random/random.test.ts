import { describe, expect, it } from "bun:test"

import {
  getRandomColor,
  getRandomDigits,
  getRandomElement,
  getRandomNumber,
  getRandomProperty,
  getRandomString,
} from "./random"

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
  it("returns a value from the array", () => {
    const array = [1, 2, 3]
    const result = getRandomElement(array)
    expect([1, 2, 3]).toContain(result)
  })
})

describe("getRandomProperty", () => {
  it("returns a value from the object", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = getRandomProperty(obj)
    expect([1, 2, 3]).toContain(result)
  })
})
