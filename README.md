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
| `batch` | `processBatch`, `processBatchWithErrorHandling` (ordered, concurrency-limited, with `onProgress`) |
| `dom` | `getElementPosition`, `setInputValue` |
| `errors` | `isErrorWithMessage`, `toErrorWithMessage`, `getErrorMessage`, `toError` |
| `events` | `subscribe`, `unsubscribe`, `publish`, `publishEscape` |
| `files` | `formatBytes`, `formatMimeType`, `isMimeTypeMatch`, `toBase64` |
| `format` | `formatNumber`, `formatCurrency`, `formatIntervalAmount`, `formatToDecimals`, `currencyExponent`, `minorUnits` |
| `helpers` | `sleep`, `isTruthy`, `tryCatch`, `debounce`, `throttle`, `retry`, `withTimeout` |
| `http` | `isValidUrl`, `normalizeUrl`, `getDomain`, `joinUrlPaths`, query-param helpers, `checkUrlAvailability`, `isHostname`, `normalizeHostname`, `stripWildcard`, `isWithinDomain` |
| `numbers` | `clamp`, `parseNumericValue`, `preciseRound` |
| `objects` | `pick`, `omit`, `isEmptyObject`, `sortObject`, `nullsToUndefined` |
| `parsers` | `maybeParseJson`, `maybeStringifyJson`, `serialize`, `deserialize` |
| `random` | `getRandomColor`, `getRandomString`, `getRandomNumber`, `getRandomElement` |
| `string` | `ucFirst`, `lcFirst`, `stripHtml`, `getExcerpt`, `slugify`, `getInitials`, `joinAsSentence` |
| `time` | `formatDate`, `formatTime`, `formatDateTime`, `formatDateOrTime`, `formatDateRange`, `getReadTime`, `dayKey`, `shiftDayKey`, `dayIn`, `fromUnix`, `toUnix`, `SECOND_MS`, `MINUTE_MS`, `HOUR_MS`, `DAY_MS`, `MINUTE_SECONDS`, `HOUR_SECONDS`, `DAY_SECONDS` |
| `ui` | `getBalancedColumns`, `getShortcutLabel`, `isLightColor`, `getCurrentPage`, `getPagination`, `getPageLink` |

> Some utilities (`dom`, `events`, `toBase64`, `setInputValue`) rely on browser APIs and are only usable in the browser.

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
type City = DeepIdx<User, "address.city">    type City = DeepIndex<User, "address.city">
```

### Date formatters take an options object only

```ts
// Before                                                   // After
formatDate(date, "long", "en-GB")                           formatDate(date, { dateStyle: "long", locale: "en-GB" })
formatTime(date, "short", "pl")                             formatTime(date, { timeStyle: "short", locale: "pl" })
formatDateTime(date, "long", "short", "de")                 formatDateTime(date, { dateStyle: "long", timeStyle: "short", locale: "de" })
formatDateOrTime(date, "date", "long", undefined, "en-GB")  formatDateOrTime(date, "date", { dateStyle: "long", locale: "en-GB" })
formatDateRange(start, end, "short", "es")                  formatDateRange(start, end, { dateStyle: "short", locale: "es" })
```

### `sortBy` takes an options object

```ts
// Before                                  // After
sortBy(posts, post => post.date, "desc")   sortBy(posts, post => post.date, { order: "desc" })
```

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
