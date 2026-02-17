import { describe, expect, it } from "bun:test"
import { getErrorMessage, isErrorWithMessage, toErrorWithMessage } from "./errors"

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
