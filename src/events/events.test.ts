import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { publish, publishEscape, subscribe, unsubscribe } from "./events"

const eventName = "cart:updated"
const globals = globalThis as Record<string, unknown>
const originalDocument = globals.document
const originalKeyboardEvent = globals.KeyboardEvent

// Neither Bun nor Node.js has a DOM, so a plain EventTarget stands in for `document`
beforeEach(() => {
  globals.document = new EventTarget()
  globals.KeyboardEvent ??= class extends Event {
    key: string

    constructor(type: string, init: KeyboardEventInit = {}) {
      super(type, init)
      this.key = init.key ?? ""
    }
  }
})

afterEach(() => {
  globals.document = originalDocument
  globals.KeyboardEvent = originalKeyboardEvent
})

describe("subscribe", () => {
  it("calls the listener when the event is dispatched", () => {
    const listener = vi.fn()

    subscribe(eventName, listener)
    document.dispatchEvent(new CustomEvent(eventName))

    expect(listener).toHaveBeenCalledTimes(1)
  })
})

describe("unsubscribe", () => {
  it("stops calling the listener", () => {
    const listener = vi.fn()

    subscribe(eventName, listener)
    unsubscribe(eventName, listener)
    document.dispatchEvent(new CustomEvent(eventName))

    expect(listener).not.toHaveBeenCalled()
  })
})

describe("publish", () => {
  it("dispatches a custom event with the data as its detail", () => {
    const listener = vi.fn()

    document.addEventListener(eventName, listener)
    publish(eventName, { items: 3 })

    expect(listener).toHaveBeenCalledTimes(1)
    expect((listener.mock.calls[0]![0] as CustomEvent).detail).toEqual({ items: 3 })
  })
})

describe("publishEscape", () => {
  it("dispatches a keydown event for the Escape key", () => {
    const listener = vi.fn()

    document.addEventListener("keydown", listener)
    publishEscape()

    expect(listener).toHaveBeenCalledTimes(1)
    expect((listener.mock.calls[0]![0] as KeyboardEvent).key).toBe("Escape")
  })
})
