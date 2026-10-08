import { describe, expect, it } from "vitest"
import { getErrorMessage, isErrorWithMessage, toError, toErrorWithMessage } from "./errors"

describe("isErrorWithMessage", () => {
  it("returns true for ErrorWithMessage", () => {
    const error = { message: "test error" }
    expect(isErrorWithMessage(error)).toBe(true)
  })

  it("returns false for non-ErrorWithMessage", () => {
    const error = new Error("test error")
    expect(isErrorWithMessage(error)).toBe(true)
  })
})

describe("toErrorWithMessage", () => {
  it("returns ErrorWithMessage for ErrorWithMessage", () => {
    const error = { message: "test error" }
    const result = toErrorWithMessage(error)
    expect(isErrorWithMessage(result)).toBe(true)
    expect(result.message).toBe("test error")
  })

  it("returns Error for non-ErrorWithMessage", () => {
    const error = new Error("test error")
    const result = toErrorWithMessage(error)
    expect(isErrorWithMessage(result)).toBe(true)
    expect(result.message).toBe("test error")
  })
})

describe("getErrorMessage", () => {
  it("returns message for ErrorWithMessage", () => {
    const error = { message: "test error" }
    expect(getErrorMessage(error)).toBe("test error")
  })

  it("returns message for non-ErrorWithMessage", () => {
    const error = new Error("test error")
    expect(getErrorMessage(error)).toBe("test error")
  })
})

describe("toError", () => {
  it("returns an Error as is", () => {
    const error = new TypeError("test error")
    expect(toError(error)).toBe(error)
  })

  it("wraps anything else", () => {
    const result = toError("test error")
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe("test error")
  })
})
