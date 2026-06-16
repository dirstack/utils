import { describe, expect, it } from "bun:test"
import {
  chunk,
  compact,
  countBy,
  groupBy,
  keyBy,
  range,
  sortBy,
  splitArrayIntoChunks,
  sum,
  sumBy,
  uniq,
  uniqBy,
} from "./array"

describe("uniqBy", () => {
  it("removes duplicates keyed by the given function", () => {
    const items = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 1, name: "c" },
    ]
    expect(uniqBy(items, i => i.id)).toEqual([
      { id: 1, name: "a" },
      { id: 2, name: "b" },
    ])
  })

  it("keeps the first occurrence of each key", () => {
    const items = [
      { id: 1, v: "first" },
      { id: 1, v: "second" },
    ]
    expect(uniqBy(items, i => i.id)).toEqual([{ id: 1, v: "first" }])
  })

  it("preserves order", () => {
    expect(uniqBy([3, 1, 3, 2, 1], n => n)).toEqual([3, 1, 2])
  })

  it("returns an empty array unchanged", () => {
    expect(uniqBy([], (i: number) => i)).toEqual([])
  })
})

describe("uniq", () => {
  it("removes duplicate primitives", () => {
    expect(uniq([1, 2, 2, 3, 1])).toEqual([1, 2, 3])
  })

  it("preserves order", () => {
    expect(uniq(["b", "a", "b", "c"])).toEqual(["b", "a", "c"])
  })
})

describe("chunk", () => {
  it("splits an array into chunks of the given size", () => {
    expect(chunk([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]])
    expect(chunk([1, 2, 3, 4, 5, 6], 5)).toEqual([[1, 2, 3, 4, 5], [6]])
    expect(chunk([], 3)).toEqual([])
  })
})

describe("splitArrayIntoChunks (deprecated alias)", () => {
  it("behaves identically to chunk", () => {
    expect(splitArrayIntoChunks([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]])
    expect(splitArrayIntoChunks).toBe(chunk)
  })
})

describe("groupBy", () => {
  it("groups items into arrays by key", () => {
    const items = [
      { type: "a", n: 1 },
      { type: "b", n: 2 },
      { type: "a", n: 3 },
    ]
    expect(groupBy(items, i => i.type)).toEqual({
      a: [
        { type: "a", n: 1 },
        { type: "a", n: 3 },
      ],
      b: [{ type: "b", n: 2 }],
    })
  })

  it("returns an empty object for an empty array", () => {
    expect(groupBy([] as { type: string }[], i => i.type)).toEqual({})
  })
})

describe("keyBy", () => {
  it("indexes items by key", () => {
    const items = [
      { id: "x", n: 1 },
      { id: "y", n: 2 },
    ]
    expect(keyBy(items, i => i.id)).toEqual({
      x: { id: "x", n: 1 },
      y: { id: "y", n: 2 },
    })
  })

  it("keeps the last item when keys collide", () => {
    const items = [
      { id: "x", n: 1 },
      { id: "x", n: 2 },
    ]
    expect(keyBy(items, i => i.id)).toEqual({ x: { id: "x", n: 2 } })
  })
})

describe("countBy", () => {
  it("counts occurrences per key", () => {
    expect(countBy(["a", "b", "a", "a", "b"], v => v)).toEqual({ a: 3, b: 2 })
  })
})

describe("compact", () => {
  it("removes falsy values", () => {
    expect(compact([1, null, 2, undefined, 0, 3, false, ""])).toEqual([1, 2, 3])
  })

  it("returns an empty array unchanged", () => {
    expect(compact([])).toEqual([])
  })
})

describe("sortBy", () => {
  it("sorts numbers ascending by default", () => {
    expect(sortBy([{ n: 3 }, { n: 1 }, { n: 2 }], i => i.n)).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }])
  })

  it("sorts descending when requested", () => {
    expect(sortBy([{ n: 1 }, { n: 3 }, { n: 2 }], i => i.n, "desc")).toEqual([
      { n: 3 },
      { n: 2 },
      { n: 1 },
    ])
  })

  it("sorts strings with localeCompare", () => {
    expect(sortBy(["banana", "apple", "cherry"], s => s)).toEqual(["apple", "banana", "cherry"])
  })

  it("sorts dates", () => {
    const a = { d: new Date("2023-01-01") }
    const b = { d: new Date("2024-01-01") }
    expect(sortBy([b, a], i => i.d)).toEqual([a, b])
  })

  it("does not mutate the input", () => {
    const input = [3, 1, 2]
    sortBy(input, n => n)
    expect(input).toEqual([3, 1, 2])
  })
})

describe("sum", () => {
  it("sums numbers", () => {
    expect(sum([1, 2, 3, 4])).toBe(10)
    expect(sum([])).toBe(0)
  })
})

describe("sumBy", () => {
  it("sums by the given key", () => {
    expect(sumBy([{ price: 10 }, { price: 5 }, { price: 15 }], i => i.price)).toBe(30)
    expect(sumBy([] as { price: number }[], i => i.price)).toBe(0)
  })
})

describe("range", () => {
  it("generates an array of numbers", () => {
    expect(range(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(range(0, 0)).toEqual([0])
    expect(range(-3, 3)).toEqual([-3, -2, -1, 0, 1, 2, 3])
  })
})
