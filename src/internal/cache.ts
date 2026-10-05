/**
 * Internal helpers shared by the formatting modules. Not exported from the package root.
 */

/**
 * Creates a getter that caches values by key and keeps at most `limit` entries.
 * When the cache is full, the oldest entry is evicted first, so keys derived from
 * request data (such as locales or time zones) cannot grow memory without limit.
 * @param limit - The maximum number of cached entries. Defaults to 100.
 * @returns A function that returns the cached value for a key, creating it on a miss.
 */
export function createBoundedCache<Value>(limit = 100) {
  const cache = new Map<string, Value>()

  return function getOrCreate(key: string, create: () => Value) {
    const cached = cache.get(key)
    if (cached !== undefined) return cached

    const value = create()

    // Maps keep insertion order, so the first key is the oldest entry
    if (cache.size >= limit) {
      cache.delete(cache.keys().next().value!)
    }

    cache.set(key, value)
    return value
  }
}

/**
 * Serializes a flat options object into a stable cache key.
 * Keys are sorted, so the order the options were written in does not matter.
 * @param options - The options to serialize.
 * @returns The serialized options.
 */
export function serializeOptions(options: object) {
  return JSON.stringify(options, Object.keys(options).sort())
}
