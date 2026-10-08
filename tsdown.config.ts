import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  platform: "neutral",
  // One output file per source module, so `dist/array/array.js` sits beside `array.d.ts`.
  unbundle: true,
  // Keep readable names in stack traces; the consumer's bundler minifies.
  minify: false,
  // `src/` ships with the package, so maps point at it instead of embedding the source again.
  sourcemap: true,
  outputOptions: { sourcemapExcludeSources: true },
  dts: { sourcemap: true },
  publint: { level: "error", strict: true },
  attw: { level: "error", profile: "esm-only" },
})
