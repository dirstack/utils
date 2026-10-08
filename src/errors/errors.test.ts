import { describe, expect, it } from "vitest"
import { getErrorMessage, toError } from "./errors"

describe("getErrorMessage", () => {
  it("returns the message of an Error", () => {
    expect(getErrorMessage(new TypeError("Upload failed"))).toBe("Upload failed")
  })

  it("returns the message of an object with a string message", () => {
    expect(getErrorMessage({ message: "Quota exceeded" })).toBe("Quota exceeded")
  })

  it("returns a thrown string as is", () => {
    expect(getErrorMessage("Network down")).toBe("Network down")
  })

  it("returns the fallback when the value has no message", () => {
    expect(getErrorMessage({ code: 500 }, "Something went wrong")).toBe("Something went wrong")
    expect(getErrorMessage(null, "Something went wrong")).toBe("Something went wrong")
    expect(getErrorMessage(new Error(""), "Something went wrong")).toBe("Something went wrong")
  })

  it("prefers the value's own message over the fallback", () => {
    expect(getErrorMessage(new Error("Upload failed"), "Something went wrong")).toBe(
      "Upload failed",
    )
  })

  it("returns the name of an Error with an empty message when there is no fallback", () => {
    expect(getErrorMessage(new Error())).toBe("Error")
    expect(getErrorMessage(new TypeError())).toBe("TypeError")
  })

  it("stringifies a value without a message when there is no fallback", () => {
    expect(getErrorMessage({ code: 500 })).toBe('{"code":500}')
    expect(getErrorMessage(42)).toBe("42")
    expect(getErrorMessage(undefined)).toBe("undefined")
  })

  it("survives values JSON cannot represent", () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular

    expect(getErrorMessage(circular)).toBe("[object Object]")
    expect(getErrorMessage(10n)).toBe("10")
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

  it("keeps the original value as the cause", () => {
    const thrown = { code: "E_QUOTA", message: "Quota exceeded" }
    const result = toError(thrown)

    expect(result.message).toBe("Quota exceeded")
    expect(result.cause).toBe(thrown)
  })

  it("describes an object without a message", () => {
    expect(toError({ code: 500 }).message).toBe('{"code":500}')
  })
})
