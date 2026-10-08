# @dirstack/utils

A lightweight, dependency-light set of TypeScript utilities shared across projects. Tree-shakeable, ESM-only, and fully typed.

## Install

```bash
bun add @dirstack/utils
# or: npm install @dirstack/utils
```

Requires Node.js 22.12 or later. The package ships ES modules only, and CommonJS code can `require()` it on these versions.

## Usage

Everything is exported from the package root:

```ts
import { chunk, clamp, formatBytes, slugify, tryCatch } from "@dirstack/utils"

chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
clamp(12, 0, 10) // 10
formatBytes(1536, 1) // "1.5 KB"
slugify("Hello World") // "hello-world"

const { data, error } = await tryCatch(fetch("/api"))
```

Each module is also available on its own path, such as `@dirstack/utils/array` or `@dirstack/utils/time`. Bundlers remove unused code from the root import either way, because the build keeps one file per module.

## What's inside

| Module | Highlights |
| --- | --- |
| `array` | `uniq`, `uniqBy`, `chunk`, `groupBy`, `keyBy`, `countBy`, `compact`, `sortBy`, `sum`, `sumBy`, `range` |
| `batch` | `processBatch`, `processBatchSettled` (ordered, concurrency-limited, with `onProgress`) |
| `errors` | `getErrorMessage`, `toError` |
| `files` | `formatBytes`, `isMimeTypeMatch`, `toBase64`, `toDataUrl` |
| `format` | `formatNumber`, `formatCurrency`, `formatIntervalAmount`, `currencyExponent`, `minorUnits` |
| `helpers` | `sleep`, `isTruthy`, `tryCatch`, `retry`, `withTimeout` |
| `http` | `isValidUrl`, `addProtocol`, `removeProtocol`, `getDomain`, `isExternalUrl`, `joinUrlPaths`, `setQueryParams`, `removeQueryParams`, `isValidImageSrc`, `isHostname`, `normalizeHostname`, `stripWildcard`, `isWithinDomain` |
| `numbers` | `clamp`, `preciseRound` |
| `objects` | `pick`, `omit`, `isEmptyObject`, `isKeyInObject` |
| `parsers` | `serialize` |
| `random` | `getRandomString`, `getRandomDigits`, `getRandomNumber`, `getRandomElement` |
| `string` | `ucFirst`, `lcFirst`, `truncate`, `slugify`, `getInitials`, `joinAsSentence` |
| `time` | `formatDate`, `formatTime`, `formatDateTime`, `formatDateRange`, `getReadTime`, `dayKey`, `shiftDayKey`, `dayIn`, `fromUnix`, `toUnix`, `SECOND_MS`, `MINUTE_MS`, `HOUR_MS`, `DAY_MS`, `MINUTE_SECONDS`, `HOUR_SECONDS`, `DAY_SECONDS` |
| `ui` | `getBalancedColumns`, `isLightColor`, `getCurrentPage`, `getPagination`, `getPageLink` |
| types | `WithOptional`, `WithRequired`, plus the types in helper signatures, such as `Result` (from `tryCatch`), `Timestamp` and `ProcessBatchOptions` |


### Dates and time zones

The date helpers accept any `Intl.DateTimeFormat` option plus a `locale` (defaults to `"en-US"`). Without a `timeZone`, they format in the time zone of the machine that runs them. On server-rendered pages, the server (often UTC) and the browser (the visitor's zone) can then produce different text, which causes React hydration errors. Pass a fixed `timeZone` to get the same output in both places:

```ts
import { formatDate, formatDateRange } from "@dirstack/utils"

formatDate("2026-10-05T23:30:00Z", { dateStyle: "long", timeZone: "UTC", locale: "en-GB" }) // "5 October 2026"
formatDate("2026-10-05", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) // "Oct 05, 2026"
formatDateRange("2026-10-05", "2026-10-09", { timeZone: "UTC" }) // "Oct 5 – 9, 2026"
```

Date-only strings such as `"2026-10-05"` parse as UTC midnight, so format them with `timeZone: "UTC"` to keep the same calendar day everywhere.

## Migrating from v2

v3 leaves one way to call each helper. Each removed alias or call form below has a direct replacement.

### Package format

The CommonJS/UMD build (`dist/index.umd.cjs`) is gone. The package is ESM-only and needs Node.js 22.12 or later.

```ts
// Before: CommonJS on any Node.js version
const { slugify } = require("@dirstack/utils")
// After: an import, or require() on Node.js 22.12+
import { slugify } from "@dirstack/utils"
```

### Removed aliases

```ts
// Before                                    // After
splitArrayIntoChunks(items, 10)              chunk(items, 10)
keepNumberInRange(value, 0, 100)             clamp(value, 0, 100)
pickFromObject(user, ["id", "name"])         pick(user, ["id", "name"])
```

### Date formatters take an options object only

```ts
// Before                                                   // After
formatDate(date, "long", "en-GB")                           formatDate(date, { dateStyle: "long", locale: "en-GB" })
formatTime(date, "short", "pl")                             formatTime(date, { timeStyle: "short", locale: "pl" })
formatDateTime(date, "long", "short", "de")                 formatDateTime(date, { dateStyle: "long", timeStyle: "short", locale: "de" })
formatDateRange(start, end, "short", "es")                  formatDateRange(start, end, { dateStyle: "short", locale: "es" })
```

### `sortBy` takes an options object

```ts
// Before                                  // After
sortBy(posts, post => post.date, "desc")   sortBy(posts, post => post.date, { order: "desc" })
```

### Removed helpers

No project used these, so v3 drops them. Each has a short native or library replacement.

| Removed | Use instead |
| --- | --- |
| `getElementPosition` | `element.getBoundingClientRect()` or `element.scrollIntoView()` |
| `setInputValue` | Copy the five lines into the project that needs them |
| `subscribe`, `unsubscribe`, `publish` | `document.addEventListener`, `removeEventListener`, `dispatchEvent(new CustomEvent(name, { detail }))` |
| `publishEscape` | `document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))` |
| `isErrorWithMessage`, `toErrorWithMessage`, `ErrorWithMessage` | `getErrorMessage(error)` or `toError(error)` |
| `formatMimeType` | `mimeType.split("/")[1]?.toUpperCase()` |
| `formatToDecimals` | `formatNumber(value, { maximumFractionDigits: 2, useGrouping: false })` |
| `debounce`, `throttle` | `useDebouncedCallback` and `useThrottledCallback` from `@mantine/hooks` |
| `getBaseUrl` | `new URL(url).origin` |
| `getQueryParams` | `Object.fromEntries(new URL(url).searchParams)` |
| `checkUrlAvailability` | `fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) })` |
| `normalizeUrl`, `isLocalhostUrl` | Still used inside the package, no longer exported |
| `parseNumericValue` | `Number.parseFloat(value)` with a `Number.isNaN` check, or `z.coerce.number()` |
| `sortObject` | `Object.fromEntries(Object.entries(source).sort(([a], [b]) => a.localeCompare(b)))` |
| `sortObjectKeys` | A comparator in the project that needs it |
| `nullsToUndefined`, `ReplaceNullWithUndefined` | Map the fields that need it |
| `maybeParseJson`, `maybeStringifyJson`, `deserialize` | `JSON.parse` and `JSON.stringify` |
| `getRandomColor` | `Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, "0")` |
| `getRandomProperty` | `getRandomElement(Object.values(source))` |
| `isCuid` | `isCuid` from `@paralleldrive/cuid2` |
| `formatDateOrTime` | `formatDate`, `formatTime` or `formatDateTime` |
| `getShortcutLabel` | A `<Kbd>` component that knows the platform's modifier key |
| `DeepIdx`, `DeepIndex`, `ValidatePath` | `Path` and `PathValue` from `react-hook-form`, or `Get` and `Paths` from `type-fest` |
| `NestedPartial`, `NestedRequired` | `PartialDeep` and `RequiredDeep` from `type-fest` |

### `processBatchWithErrorHandling` is now `processBatchSettled`

Like `Promise.allSettled`, each result now says whether its item succeeded and carries the item, instead of mixing values and `Error` objects in one array. Options, including `onError`, are unchanged.

```ts
// Before
const results = await processBatchWithErrorHandling(items, processor, { batchSize: 10 })
const failed = results.filter(result => result instanceof Error)

// After
const results = await processBatchSettled(items, processor, { batchSize: 10 })
const failed = results.filter(result => result.status === "rejected") // { item, error }
```

### `toBase64` returns plain Base64, and `toDataUrl` returns the data URL

`toBase64` used to return a data URL (`data:image/png;base64,…`), so most callers stripped the prefix. It now returns the Base64 string alone, and `toDataUrl` returns the full data URL. Both accept any `Blob` and work in Node.js too.

```ts
// Before                                                          // After
(await toBase64(file)).replace(/^data:[^;]+;base64,/, "")          await toBase64(file)
await toBase64(file) // when the data URL was wanted                await toDataUrl(file)
```

### `slugify` takes an options object

```ts
// Before                         // After
slugify(title, true)              slugify(title, { decamelize: true })
```

### `getExcerpt` is now `truncate`

Every caller passed plain text, so `truncate` drops the HTML stripping (which also deleted any text after a `<`). It cuts between words, never splits an emoji, and keeps the result within `length` including the `…`.

```ts
// Before                              // After
getExcerpt(description, 125)           truncate(description, 125)
```

Three details changed: the ellipsis is `…` instead of `...`, it counts toward `length`, and empty input returns `""` instead of `null`. `stripHtml` and `convertNewlines` are removed too.

### `getPageParams` is now `getPagination`

`getPageParams` read the page from a URL and returned the other query parameters under an unchecked type. `getPagination` only does the math: parse the page with your router or nuqs first.

```ts
// Before                                    // After
getPageParams<Filters>(url, 20)              getPagination({ page, perPage: 20 }) // { skip, take }
```

### `joinAsSentence` takes an options object

```ts
// Before                                       // After
joinAsSentence(names)                           joinAsSentence(names, { limit: 3, locale: "en-GB" })
joinAsSentence(names, 5)                        joinAsSentence(names, { limit: 5, locale: "en-GB" })
joinAsSentence(names, undefined, t("and"))      joinAsSentence(names, { locale })
joinAsSentence(names, undefined, "or")          joinAsSentence(names, { type: "disjunction", locale: "en-GB" })
```

`joinAsSentence` now formats with `Intl.ListFormat`, which changes its output in three ways:

- It has no default limit. A `limit` collapses the rest into one trailing item ("a, b, and 2 more") instead of dropping it, and never hides a single item.
- The default `en-US` locale adds a serial comma: "a, b, and c". Pass `locale: "en-GB"` for "a, b and c", as in v2.
- The locale sets the conjunction and punctuation. Pass the active locale instead of a translated "and".

## Development

```bash
bun install        # install dependencies
bun test           # run the test suite on Bun
bun run test:node  # run the same suite on Node.js with Vitest
bun run typecheck
bun run lint
bun run build      # build with tsdown, then check the package with publint and attw
```

## License

MIT © [Piotr Kulpinski](https://kulpinski.pl)
