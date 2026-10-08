/**
 * Utility functions for parsing and stringifying JSON.
 */

/**
 * Serializes a value by converting it to JSON and back, producing a deep clone with only JSON-safe values.
 * Strips functions, undefined, symbols, and other non-serializable values.
 * @param data - The value to serialize.
 * @returns A deep clone of the value with only JSON-serializable properties.
 * @template T - The type of the value.
 */
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}
