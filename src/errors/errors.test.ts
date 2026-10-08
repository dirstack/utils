import { describe, expect, it } from "vitest"
import { getErrorMessage, toError } from "./errors"

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
