import { describe, expect, it } from "bun:test"
import { isLightColor } from "./colors"

describe("isLightColor", () => {
  // Basic cases
  it("should identify white as light", () => {
    expect(isLightColor("#FFFFFF")).toBe(true)
  })

  it("should identify black as dark", () => {
    expect(isLightColor("#000000")).toBe(false)
  })

  // Edge cases
  it("should handle hex without #", () => {
    expect(isLightColor("FFFFFF")).toBe(true)
    expect(isLightColor("000000")).toBe(false)
  })

  it("should handle different hex case formats", () => {
    expect(isLightColor("#ffffff")).toBe(true)
    expect(isLightColor("#FFFFFF")).toBe(true)
    expect(isLightColor("#fFfFfF")).toBe(true)
  })

  // Trimming cases
  it("should trim longer hex strings", () => {
    expect(isLightColor("#FFFFFF00")).toBe(true) // Should trim off the alpha
    expect(isLightColor("#000000FF")).toBe(false) // Should trim off the alpha
    expect(isLightColor("#FF0000AABBCC")).toBe(false) // Should only use first 6 chars
  })

  // Borderline cases
  it("should handle colors near the brightness threshold", () => {
    expect(isLightColor("#BBBBBB")).toBe(true) // Just above threshold
    expect(isLightColor("#999999")).toBe(false) // Just below threshold
  })

  // Complex colors
  it("should correctly evaluate complex colors", () => {
    expect(isLightColor("#FF0000")).toBe(false) // Pure red (dark)
    expect(isLightColor("#00FF00")).toBe(false) // Pure green (dark)
    expect(isLightColor("#0000FF")).toBe(false) // Pure blue (dark)
    expect(isLightColor("#FF69B4")).toBe(false) // Hot pink (dark)
    expect(isLightColor("#800080")).toBe(false) // Purple (dark)
    expect(isLightColor("#87CEEB")).toBe(true) // Sky blue (light)
    expect(isLightColor("#98FB98")).toBe(true) // Pale green (light)
    expect(isLightColor("#800000")).toBe(false) // Maroon (dark)
  })
})
