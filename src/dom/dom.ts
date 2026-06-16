/**
 * Utility functions for working with the DOM and browser APIs.
 */

/**
 * Returns the position of an element with the given ID relative to the top of the viewport.
 * @param id - The ID of the element to get the position of.
 * @returns An object with the ID and top position of the element, or undefined if the element is not found.
 */
export const getElementPosition = (id?: string) => {
  const el = document.getElementById(id || "")
  if (!el) return

  const style = window.getComputedStyle(el)
  const scrollMt = Number.parseFloat(style.scrollMarginTop)
  const top = Math.floor(window.scrollY + el.getBoundingClientRect().top - scrollMt)

  return { id, top }
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
 * Converts a File object to a Base64 encoded string.
 * @param file - The File object to be converted.
 * @returns A promise that resolves with the Base64 encoded string.
 */
export const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

/**
 * Set the value of an HTMLInputElement using its native value setter.
 *
 * @param input - The HTMLInputElement to set the value of.
 * @param value - The value to set on the input element.
 */
export const setInputValue = (
  input: HTMLInputElement | null | undefined,
  value: unknown,
  triggerChange = false,
) => {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set

  nativeInputValueSetter?.call(input, value)

  // Trigger a change event if the value was changed
  if (triggerChange) {
    input?.dispatchEvent(new Event("input", { bubbles: true }))
  }
}
