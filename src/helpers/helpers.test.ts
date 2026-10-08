import { describe, expect, it, spyOn } from "bun:test"
import { debounce, isTruthy, retry, sleep, throttle, tryCatch, withTimeout } from "./helpers"

describe("isTruthy", () => {
  it("checks if a value is truthy", () => {
    expect(isTruthy("hello")).toEqual(true)
    expect(isTruthy(0)).toEqual(false)
    expect(isTruthy(null)).toEqual(false)
    expect(isTruthy(undefined)).toEqual(false)
    expect(isTruthy(false)).toEqual(false)
  })
})

describe("tryCatch", () => {
  it("should return data when promise resolves", async () => {
    const promise = Promise.resolve("success")
    const result = await tryCatch(promise)

    expect(result.data).toEqual("success")
    expect(result.error).toBeNull()
  })

  it("should return error when promise rejects", async () => {
    const error = new Error("failure")
    const promise = Promise.reject(error)
    const result = await tryCatch(promise)

    expect(result.data).toBeNull()
    expect(result.error).toEqual(error)
  })
})

describe("debounce", () => {
  it("invokes the function once after the delay with the latest args", async () => {
    const calls: number[] = []
    const fn = debounce((n: number) => calls.push(n), 30)

    fn(1)
    fn(2)
    fn(3)
    expect(calls).toEqual([])

    await sleep(60)
    expect(calls).toEqual([3])
  })

  it("cancel prevents a pending invocation", async () => {
    let calls = 0
    const fn = debounce(() => {
      calls++
    }, 30)

    fn()
    fn.cancel()

    await sleep(60)
    expect(calls).toBe(0)
  })
})

describe("throttle", () => {
  it("fires on the leading edge and trails with the latest args", async () => {
    const calls: number[] = []
    const fn = throttle((n: number) => calls.push(n), 40)

    fn(1)
    fn(2)
    fn(3)
    expect(calls).toEqual([1])

    await sleep(70)
    expect(calls).toEqual([1, 3])
  })
})

describe("retry", () => {
  it("returns the result on the first successful attempt", async () => {
    let attempts = 0
    const result = await retry(async () => {
      attempts++
      return "ok"
    })

    expect(result).toBe("ok")
    expect(attempts).toBe(1)
  })

  it("retries until the function succeeds", async () => {
    let attempts = 0
    const result = await retry(
      async () => {
        attempts++
        if (attempts < 3) throw new Error("fail")
        return "ok"
      },
      { retries: 5 },
    )

    expect(result).toBe("ok")
    expect(attempts).toBe(3)
  })

  it("rethrows the last error once retries are exhausted", async () => {
    let attempts = 0
    function onRetry(_error: unknown, attempt: number) {
      expect(attempt).toBe(attempts)
    }

    await expect(
      retry(
        async () => {
          attempts++
          throw new Error(`fail ${attempts}`)
        },
        { retries: 2, onRetry },
      ),
    ).rejects.toThrow("fail 3")

    // 1 initial attempt + 2 retries
    expect(attempts).toBe(3)
  })
})

describe("withTimeout", () => {
  it("resolves with the value when the promise settles in time", async () => {
    expect(await withTimeout(Promise.resolve("ok"), 50)).toBe("ok")
  })

  it("rejects with the promise's own error when it fails in time", async () => {
    await expect(withTimeout(Promise.reject(new Error("boom")), 50)).rejects.toThrow("boom")
  })

  it("rejects with a default message after the timeout", async () => {
    const promise = withTimeout(sleep(100), 10)

    await expect(promise).rejects.toThrow("Timed out after 10ms")
    await expect(promise).rejects.toBeInstanceOf(Error)
  })

  it("rejects with a custom message after the timeout", async () => {
    await expect(withTimeout(sleep(100), 10, "Health check timed out")).rejects.toThrow(
      "Health check timed out",
    )
  })

  it("clears the timer when the promise settles first", async () => {
    const clearTimeoutSpy = spyOn(globalThis, "clearTimeout")

    await withTimeout(Promise.resolve("ok"), 10_000)

    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1)
    clearTimeoutSpy.mockRestore()
  })
})
