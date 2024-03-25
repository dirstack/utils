import slugifyString from "@sindresorhus/slugify"

/**
 * A collection of helper functions used throughout the application.
 */

/**
 * A utility function that generates an array of numbers within a specified range.
 * @param start - The starting number of the range.
 * @param end - The ending number of the range.
 * @returns An array of numbers within the specified range.
 */
export const range = (start: number, end: number) => {
  const length = end - start + 1

  return Array.from({ length }, (_, idx) => idx + start)
}

/**
 * Delays the execution of the function by the specified amount of time.
 * @param delay - The amount of time to delay the execution of the function, in milliseconds.
 */
export const sleep = async (delay: number) => {
  new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Returns a label for the first search key shortcut found.
 * @returns The label for the shortcut.
 */
export const getShortcutLabel = ({ key, metaKey }: { key: string; metaKey?: boolean }) => {
  const label = `${metaKey ? "⌘" : ""}${key.toUpperCase()}`
  return label
}

/**
 * Strip html tags from a string
 * @param string - string to strip tags from
 * @returns string without html tags
 */
export const stripHtml = (string: string) => {
  return string.replace(/<[^>]*>?/gm, "")
}

/**
 * Convert newlines to specified element
 * @param string - string to convert
 * @param replacement - replacement to convert newlines to
 * @returns string with newlines converted to specified element
 */
export const convertNewlines = (string: string, replacement = " ") => {
  return string.replace(/\n+/g, replacement)
}

/**
 * Get an excerpt from a string
 * @param content - The string to get an excerpt from
 * @param length - The length of the excerpt
 * @returns An excerpt from the string
 */
export const getExcerpt = (content: string | undefined | null, length = 250) => {
  if (!content) {
    return null
  }

  const plainText = convertNewlines(stripHtml(content))
  const text = plainText.slice(0, length).trim()

  if (text.length < plainText.length) {
    return `${text}...`
  }

  return text
}

/**
 * Converts a string into a slugified version.
 *
 * @param input The string to be slugified.
 * @param decamelize Whether to decamelize the string. Defaults to false.
 * @returns The slugified string.
 */
export const slugify = (input: string, decamelize = false): string => {
  return slugifyString(input, {
    decamelize,
    customReplacements: [
      ["#", "sharp"],
      ["+", "plus"],
    ],
  })
}

/**
 * Check if a given string is a valid cuid
 * @param id A string to check
 * @returns A boolean indicating if the string is a cuid
 */
export const isCuid = (id: string) => {
  return id.length === 25 && id[0] === "c"
}

/**
 * Check if a value is truthy
 * @param value - The value to check
 * @returns A boolean indicating if the value is truthy
 */
export function isTruthy<T>(value?: T | undefined | null | false): value is T {
  return !!value
}

/**
 * Get the initials from a string
 * @param value A string to get the initials from
 * @param limit The maximum number of initials to return
 * @returns The initials from the string
 */
export const getInitials = (value?: string | null, limit = 0) => {
  const val = (value || "").trim()

  // If the value is empty, a single character, or two characters (already initials)
  if (val.length === 0 || val.length === 1 || val.length === 2) {
    return val.toUpperCase()
  }

  const values = val.split(" ").filter(isTruthy)
  const initials = values.map((name) => name.charAt(0).toUpperCase()).join("")

  if (limit > 0) {
    return initials.slice(0, limit)
  }

  return initials
}

/**
 * Converts a File object to a Base64 encoded string.
 * @param file - The File object to be converted.
 * @returns A promise that resolves with the Base64 encoded string.
 */
export const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Splits an array into chunks of a specified size.
 * @param array - The array to split into chunks.
 * @param chunkSize - The size of each chunk.
 * @returns An array of arrays, each containing a chunk of the original array.
 */
export const splitArrayChunks = <T>(array: T[], chunkSize: number) => {
  const chunks: T[][] = []

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }

  return chunks
}
