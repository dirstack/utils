import baseConfig from "@dirstack/kodeks/oxlint"
import { defineConfig } from "oxlint"

export default defineConfig({
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    // The published type declarations come from `tsc`, which does not rewrite `~/*` aliases,
    // so this library keeps relative imports.
    "no-restricted-imports": "off",
  },
})
