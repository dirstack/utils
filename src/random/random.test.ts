import { describe, expect, it } from "bun:test"

import { getRandomColor, getRandomProperty, getRandomString } from "./random"

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

  it("returns a string with length between 2 and 13", () => {
    const result = getRandomString()
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.length).toBeLessThanOrEqual(13)
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

describe("getRandomProperty", () => {
  it("returns a value from the object", () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = getRandomProperty(obj)
    expect([1, 2, 3]).toContain(result)
  })
})
