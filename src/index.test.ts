import { expect, it } from "bun:test"
import type { DeepIdx, DeepIndex } from "."

interface User {
  address: { city: string }
}

it("resolves dot-separated paths", () => {
  const city: DeepIndex<User, "address.city"> = "Warsaw"
  const legacyCity: DeepIdx<User, "address.city"> = city
  expect(legacyCity).toBe("Warsaw")

  // @ts-expect-error The path resolves to a string, not a number.
  const wrongCity: DeepIndex<User, "address.city"> = 5
  expect(typeof wrongCity).toBe("number")
})
