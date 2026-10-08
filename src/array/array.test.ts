import { describe, expect, it } from "bun:test"
import {
  chunk,
  compact,
  countBy,
  groupBy,
  keyBy,
  range,
  sortBy,
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
    expect(uniqBy(items, item => item.id)).toEqual([
      { id: 1, name: "a" },
      { id: 2, name: "b" },
    ])
  })

  it("keeps the first occurrence of each key", () => {
    const items = [
      { id: 1, v: "first" },
      { id: 1, v: "second" },
    ]
    expect(uniqBy(items, item => item.id)).toEqual([{ id: 1, v: "first" }])
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

describe("groupBy", () => {
  it("groups items into arrays by key", () => {
    const items = [
      { type: "a", n: 1 },
      { type: "b", n: 2 },
      { type: "a", n: 3 },
    ]
    expect(groupBy(items, item => item.type)).toEqual({
      a: [
        { type: "a", n: 1 },
        { type: "a", n: 3 },
      ],
      b: [{ type: "b", n: 2 }],
    })
  })

  it("returns an empty object for an empty array", () => {
    expect(groupBy([] as { type: string }[], item => item.type)).toEqual({})
  })
})

describe("keyBy", () => {
  it("indexes items by key", () => {
    const items = [
      { id: "x", n: 1 },
      { id: "y", n: 2 },
    ]
    expect(keyBy(items, item => item.id)).toEqual({
      x: { id: "x", n: 1 },
      y: { id: "y", n: 2 },
    })
  })

  it("keeps the last item when keys collide", () => {
    const items = [
      { id: "x", n: 1 },
      { id: "x", n: 2 },
    ]
    expect(keyBy(items, item => item.id)).toEqual({ x: { id: "x", n: 2 } })
  })

  it("stores the value returned from value", () => {
    const items = [
      { id: "x", label: "Ten" },
      { id: "y", label: "Twenty" },
    ]
    const labels: Record<string, string> = keyBy(
      items,
      item => item.id,
      item => item.label,
    )
    expect(labels).toEqual({ x: "Ten", y: "Twenty" })
  })

  it("keeps the last value when keys collide", () => {
    const items = [
      { id: "x", n: 1 },
      { id: "x", n: 2 },
    ]
    expect(
      keyBy(
        items,
        item => item.id,
        item => item.n,
      ),
    ).toEqual({ x: 2 })
  })

  it("types the result by the stored value", () => {
    const items = [{ id: "x", n: 1 }]

    // @ts-expect-error Without `value`, the whole item is stored, not a number.
    const wrong: Record<string, number> = keyBy(items, item => item.id)
    expect(Object.keys(wrong)).toEqual(["x"])
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
    expect(sortBy([{ n: 3 }, { n: 1 }, { n: 2 }], item => item.n)).toEqual([
      { n: 1 },
      { n: 2 },
      { n: 3 },
    ])
  })

  it("sorts descending when requested", () => {
    expect(sortBy([{ n: 1 }, { n: 3 }, { n: 2 }], item => item.n, { order: "desc" })).toEqual([
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
    expect(sortBy([b, a], item => item.d)).toEqual([a, b])
  })

  it("does not mutate the input", () => {
    const input = [3, 1, 2]
    sortBy(input, n => n)
    expect(input).toEqual([3, 1, 2])
  })

  it("breaks ties with later keys", () => {
    const users = [
      { name: "Cleo", score: 2 },
      { name: "Ada", score: 1 },
      { name: "Bea", score: 2 },
    ]
    expect(sortBy(users, [user => user.score, user => user.name])).toEqual([
      { name: "Ada", score: 1 },
      { name: "Bea", score: 2 },
      { name: "Cleo", score: 2 },
    ])
  })

  it("applies the order of each key object", () => {
    const users = [
      { name: "Ada", score: 1 },
      { name: "Cleo", score: 2 },
      { name: "Bea", score: 2 },
    ]
    expect(sortBy(users, [{ key: user => user.score, order: "desc" }, user => user.name])).toEqual([
      { name: "Bea", score: 2 },
      { name: "Cleo", score: 2 },
      { name: "Ada", score: 1 },
    ])
  })

  it("uses the order option for keys without their own order", () => {
    const users = [
      { name: "Ada", score: 1 },
      { name: "Bea", score: 2 },
      { name: "Cleo", score: 2 },
    ]
    expect(
      sortBy(users, [user => user.score, { key: user => user.name, order: "asc" }], {
        order: "desc",
      }),
    ).toEqual([
      { name: "Bea", score: 2 },
      { name: "Cleo", score: 2 },
      { name: "Ada", score: 1 },
    ])
  })

  it("accepts a single key object", () => {
    expect(sortBy([1, 3, 2], { key: n => n, order: "desc" })).toEqual([3, 2, 1])
  })

  it("keeps the input order for items with equal keys", () => {
    const items = [
      { id: 1, group: "b" },
      { id: 2, group: "a" },
      { id: 3, group: "b" },
      { id: 4, group: "a" },
    ]
    expect(sortBy(items, item => item.group).map(item => item.id)).toEqual([2, 4, 1, 3])
  })

  it("compares strings by locale by default", () => {
    expect(sortBy(["b", "B", "a", "A"], s => s)).toEqual(["a", "A", "b", "B"])
  })

  it("compares strings by code unit with compare: binary", () => {
    expect(sortBy(["b", "B", "a", "A"], s => s, { compare: "binary" })).toEqual([
      "A",
      "B",
      "a",
      "b",
    ])
    expect(sortBy(["é", "z", "e"], s => s, { compare: "binary" })).toEqual(["e", "z", "é"])
  })

  it("calls each key once per item", () => {
    let calls = 0
    sortBy([5, 3, 4, 1, 2], n => {
      calls++
      return n
    })
    expect(calls).toBe(5)
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
    expect(sumBy([{ price: 10 }, { price: 5 }, { price: 15 }], item => item.price)).toBe(30)
    expect(sumBy([] as { price: number }[], item => item.price)).toBe(0)
  })
})

describe("range", () => {
  it("generates an array of numbers", () => {
    expect(range(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(range(0, 0)).toEqual([0])
    expect(range(-3, 3)).toEqual([-3, -2, -1, 0, 1, 2, 3])
  })
})

describe("readonly arrays", () => {
  it("accepts a frozen as const list without a spread", () => {
    const sizes = Object.freeze(["small", "large", "medium", "large"] as const)
    const prices = [3, 1, 2] as const

    expect(uniq(sizes)).toEqual(["small", "large", "medium"])
    expect(uniqBy(sizes, size => size.length)).toEqual(["small", "medium"])
    expect(chunk(sizes, 3)).toEqual([["small", "large", "medium"], ["large"]])
    expect(groupBy(sizes, size => size.length)).toEqual({
      5: ["small", "large", "large"],
      6: ["medium"],
    })
    expect(keyBy(sizes, size => size)).toEqual({ small: "small", large: "large", medium: "medium" })
    expect(countBy(sizes, size => size)).toEqual({ small: 1, large: 2, medium: 1 })
    expect(compact([0, 1, null] as const)).toEqual([1])
    expect(sortBy(prices, price => price)).toEqual([1, 2, 3])
    expect(sum(prices)).toBe(6)
    expect(sumBy(prices, price => price * 2)).toBe(12)
  })
})
