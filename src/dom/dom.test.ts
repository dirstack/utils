import { beforeEach, describe, expect, it, jest } from "bun:test"
import { getElementPosition, getShortcutLabel } from "./dom"

// Mock DOM methods
const mockGetElementById = jest.fn()
const mockGetComputedStyle = jest.fn()
const mockGetBoundingClientRect = jest.fn()

// Setup global mocks
Object.defineProperty(global, "document", {
  value: {
    getElementById: mockGetElementById,
  },
  writable: true,
})

Object.defineProperty(global, "window", {
  value: {
    getComputedStyle: mockGetComputedStyle,
    scrollY: 0,
  },
  writable: true,
})

describe("getElementPosition", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset window.scrollY
    Object.defineProperty(window, "scrollY", {
      value: 0,
      writable: true,
    })
  })

  it("should return undefined when element is not found", () => {
    mockGetElementById.mockReturnValue(null)

    const result = getElementPosition("non-existent-id")

    expect(result).toBeUndefined()
    expect(mockGetElementById).toHaveBeenCalledWith("non-existent-id")
  })

  it("should return undefined when id is empty string", () => {
    mockGetElementById.mockReturnValue(null)

    const result = getElementPosition("")

    expect(result).toBeUndefined()
    expect(mockGetElementById).toHaveBeenCalledWith("")
  })

  it("should return undefined when id is undefined", () => {
    mockGetElementById.mockReturnValue(null)

    const result = getElementPosition(undefined)

    expect(result).toBeUndefined()
    expect(mockGetElementById).toHaveBeenCalledWith("")
  })

  it("should calculate position correctly with no scroll margin", () => {
    const mockElement = {
      getBoundingClientRect: mockGetBoundingClientRect,
    }

    mockGetElementById.mockReturnValue(mockElement)
    mockGetBoundingClientRect.mockReturnValue({ top: 100 })
    mockGetComputedStyle.mockReturnValue({ scrollMarginTop: "0px" })

    // Set scroll position
    Object.defineProperty(window, "scrollY", { value: 50, writable: true })

    const result = getElementPosition("test-id")

    expect(result).toEqual({
      id: "test-id",
      top: 150, // 50 (scrollY) + 100 (getBoundingClientRect.top) - 0 (scrollMarginTop)
    })
    expect(mockGetElementById).toHaveBeenCalledWith("test-id")
    expect(mockGetComputedStyle).toHaveBeenCalledWith(mockElement)
  })

  it("should calculate position correctly with scroll margin", () => {
    const mockElement = {
      getBoundingClientRect: mockGetBoundingClientRect,
    }

    mockGetElementById.mockReturnValue(mockElement)
    mockGetBoundingClientRect.mockReturnValue({ top: 200 })
    mockGetComputedStyle.mockReturnValue({ scrollMarginTop: "20px" })

    // Set scroll position
    Object.defineProperty(window, "scrollY", { value: 100, writable: true })

    const result = getElementPosition("test-id")

    expect(result).toEqual({
      id: "test-id",
      top: 280, // 100 (scrollY) + 200 (getBoundingClientRect.top) - 20 (scrollMarginTop)
    })
  })

  it("should handle fractional scroll margin values", () => {
    const mockElement = {
      getBoundingClientRect: mockGetBoundingClientRect,
    }

    mockGetElementById.mockReturnValue(mockElement)
    mockGetBoundingClientRect.mockReturnValue({ top: 150.5 })
    mockGetComputedStyle.mockReturnValue({ scrollMarginTop: "10.7px" })

    // Set scroll position
    Object.defineProperty(window, "scrollY", { value: 75.3, writable: true })

    const result = getElementPosition("test-id")

    expect(result).toEqual({
      id: "test-id",
      top: 215, // Math.floor(75.3 + 150.5 - 10.7) = Math.floor(215.1) = 215
    })
  })

  it("should handle zero scroll position", () => {
    const mockElement = {
      getBoundingClientRect: mockGetBoundingClientRect,
    }

    mockGetElementById.mockReturnValue(mockElement)
    mockGetBoundingClientRect.mockReturnValue({ top: 300 })
    mockGetComputedStyle.mockReturnValue({ scrollMarginTop: "10px" })

    // window.scrollY is already 0 from beforeEach

    const result = getElementPosition("test-id")

    expect(result).toEqual({
      id: "test-id",
      top: 290, // 0 + 300 - 10
    })
  })

  it("should handle negative getBoundingClientRect top values", () => {
    const mockElement = {
      getBoundingClientRect: mockGetBoundingClientRect,
    }

    mockGetElementById.mockReturnValue(mockElement)
    mockGetBoundingClientRect.mockReturnValue({ top: -50 })
    mockGetComputedStyle.mockReturnValue({ scrollMarginTop: "0px" })

    Object.defineProperty(window, "scrollY", { value: 200, writable: true })

    const result = getElementPosition("test-id")

    expect(result).toEqual({
      id: "test-id",
      top: 150, // 200 + (-50) - 0
    })
  })
})

describe("getShortcutLabel", () => {
  it("returns the uppercase key if metaKey is not provided", () => {
    expect(getShortcutLabel({ key: "a" })).toEqual("A")
    expect(getShortcutLabel({ key: "z" })).toEqual("Z")
  })

  it("returns the uppercase key with metaKey symbol if metaKey is true", () => {
    expect(getShortcutLabel({ key: "a", metaKey: true })).toEqual("⌘A")
    expect(getShortcutLabel({ key: "z", metaKey: true })).toEqual("⌘Z")
  })

  it("returns the uppercase key without metaKey symbol if metaKey is false", () => {
    expect(getShortcutLabel({ key: "a", metaKey: false })).toEqual("A")
    expect(getShortcutLabel({ key: "z", metaKey: false })).toEqual("Z")
  })
})
