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
