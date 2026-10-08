import { resolve } from "node:path"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "./src/index.ts"),
      formats: ["es"],
    },
    // Keep readable names in stack traces and source maps; the consumer's bundler minifies
    minify: false,
    rollupOptions: {
      external: ["@sindresorhus/slugify"],
      output: {
        // One output file per source module, so `dist/array/array.js` sits beside `array.d.ts`
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
    sourcemap: true,
  },
})
