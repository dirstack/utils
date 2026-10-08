/**
 * Utility functions for parsing and stringifying JSON.
 */

/**
 * Round-trips a value through JSON, producing a deep clone with only JSON-safe values, such as
 * data passed from a server to a client component. Functions, `undefined` and symbols are dropped,
 * and dates become ISO strings, although the return type still says `T`.
 * @param data - The value to serialize.
 * @returns A deep clone of the value with only JSON-serializable properties, or `undefined` when
 * JSON cannot represent the value at all (such as `undefined` or a function).
 * @template T - The type of the value.
 */
export function serialize<T>(data: T): T {
  const json = JSON.stringify(data)
  return json === undefined ? (undefined as T) : JSON.parse(json)
}
