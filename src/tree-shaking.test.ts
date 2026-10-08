import { beforeAll, describe, expect, it } from "bun:test"
import { rm } from "node:fs/promises"
import { relative, resolve } from "node:path"
import { build as bundle } from "esbuild"
import { build } from "tsdown"

const root = resolve(import.meta.dir, "..")

// A fresh library build, so the test always checks the current source. It sits inside the
// package, so bare imports resolve and the package's `sideEffects` field applies, as in `dist`.
const outDir = resolve(root, "node_modules/.cache/tree-shaking")

/**
 * Bundles a one-line entry that re-exports `name` from the library build, the way a
 * consumer's bundler would. Identifiers are kept, so the output can be searched by name.
 */
async function bundleExport(name: string) {
  const result = await bundle({
    stdin: { contents: `export { ${name} } from "./index.js"`, resolveDir: outDir },
    bundle: true,
    format: "esm",
    metafile: true,
    minifySyntax: true,
    minifyWhitespace: true,
    write: false,
    logLevel: "silent",
  })

  const code = result.outputFiles[0]!.text
  const output = Object.values(result.metafile.outputs)[0]!

  // The library modules that contributed code to the bundle
  const modules = Object.entries(output.inputs)
    .filter(([path, { bytesInOutput }]) => bytesInOutput > 0 && path !== "<stdin>")
    .map(([path]) => relative(outDir, resolve(root, path)))
    .sort()

  return { code, modules, bytes: new TextEncoder().encode(code).length }
}

beforeAll(async () => {
  await rm(outDir, { recursive: true, force: true })
  await build({
    config: resolve(root, "tsdown.config.ts"),
    cwd: root,
    outDir,
    dts: false,
    sourcemap: false,
    publint: false,
    attw: false,
    report: false,
    logLevel: "silent",
  })
}, 30_000)

describe("tree shaking", () => {
  it("bundles sumBy on its own", async () => {
    const { code, modules, bytes } = await bundleExport("sumBy")

    expect(bytes).toBeLessThan(1024)
    expect(code).not.toContain("slugify")
    expect(code).not.toContain("transliterate")
    expect(modules).toEqual(["array/array.js"])
  })

  it("bundles formatNumber with the bounded cache and nothing else", async () => {
    const { code, modules, bytes } = await bundleExport("formatNumber")

    expect(bytes).toBeLessThan(1024)
    expect(code).toContain("createBoundedCache")
    expect(code).not.toContain("slugify")
    expect(code).not.toContain("transliterate")
    expect(modules).toEqual(["format/format.js", "internal/cache.js"])
  })
})
