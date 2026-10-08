import { describe, expect, it, vi } from "vitest"
import { createBoundedCache, serializeOptions } from "./cache"

describe("createBoundedCache", () => {
  it("creates a value once per key", () => {
    const getOrCreate = createBoundedCache<number>()
    const create = vi.fn(() => 1)

    expect(getOrCreate("a", create)).toBe(1)
    expect(getOrCreate("a", create)).toBe(1)
    expect(create).toHaveBeenCalledTimes(1)
  })

  it("evicts the oldest entry once the limit is reached", () => {
    const getOrCreate = createBoundedCache<string>(2)
    const create = vi.fn((value: string) => value)

    getOrCreate("a", () => create("a"))
    getOrCreate("b", () => create("b"))
    getOrCreate("c", () => create("c"))
    expect(create).toHaveBeenCalledTimes(3)

    // "b" is still cached, "a" was evicted
    getOrCreate("b", () => create("b"))
    expect(create).toHaveBeenCalledTimes(3)
    getOrCreate("a", () => create("a"))
    expect(create).toHaveBeenCalledTimes(4)
  })
})

describe("serializeOptions", () => {
  it("ignores key order", () => {
    expect(serializeOptions({ a: 1, b: 2 })).toBe(serializeOptions({ b: 2, a: 1 }))
  })

  it("drops undefined values", () => {
    expect(serializeOptions({ a: 1, b: undefined })).toBe(serializeOptions({ a: 1 }))
  })
})
