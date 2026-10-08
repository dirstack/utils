/**
 * Utility functions for working with the DOM and browser APIs.
 */

/**
 * Returns the position of an element with the given ID relative to the top of the viewport.
 * @param id - The ID of the element to get the position of.
 * @returns An object with the ID and top position of the element, or undefined if the element is not found.
 */
export function getElementPosition(
  id?: string,
): { id: string | undefined; top: number } | undefined {
  const element = document.getElementById(id ?? "")
  if (!element) return

  const style = window.getComputedStyle(element)
  const scrollMarginTop = Number.parseFloat(style.scrollMarginTop)
  const top = Math.floor(window.scrollY + element.getBoundingClientRect().top - scrollMarginTop)

  return { id, top }
}

/**
 * Set the value of an HTMLInputElement using its native value setter.
 * @param input - The HTMLInputElement to set the value of.
 * @param value - The value to set on the input element.
 * @param triggerChange - Whether to dispatch a bubbling `input` event after setting the value,
 * so frameworks such as React pick up the change. Defaults to false.
 */
export function setInputValue(
  input: HTMLInputElement | null | undefined,
  value: unknown,
  triggerChange = false,
): void {
  if (!input) return

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set

  nativeInputValueSetter?.call(input, value)

  if (triggerChange) {
    input.dispatchEvent(new Event("input", { bubbles: true }))
  }
}
