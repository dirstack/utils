# @dirstack/utils

A lightweight, dependency-light set of TypeScript utilities shared across projects. Tree-shakeable, ESM-first (with a CommonJS build), and fully typed.

## Install

```bash
bun add @dirstack/utils
# or: npm install @dirstack/utils
```

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

## What's inside

| Module | Highlights |
| --- | --- |
| `array` | `uniq`, `uniqBy`, `chunk`, `groupBy`, `keyBy`, `countBy`, `compact`, `sortBy`, `sum`, `sumBy`, `range` |
| `batch` | `processBatch`, `processBatchWithErrorHandling` (ordered, concurrency-limited, with `onProgress`) |
| `colors` | `isLightColor` |
| `dom` | `getElementPosition`, `getShortcutLabel`, `toBase64`, `setInputValue` |
| `errors` | `isErrorWithMessage`, `toErrorWithMessage`, `getErrorMessage` |
| `events` | `subscribe`, `unsubscribe`, `publish`, `publishEscape` |
| `format` | `formatNumber`, `formatCurrency`, `formatBytes`, `formatMimeType`, `isMimeTypeMatch` |
| `helpers` | `sleep`, `isTruthy`, `tryCatch`, `debounce`, `throttle`, `retry` |
| `http` | `isValidUrl`, `normalizeUrl`, `getDomain`, `joinUrlPaths`, query-param helpers, `checkUrlAvailability` |
| `numbers` | `clamp`, `parseNumericValue`, `preciseRound` |
| `objects` | `pick`, `omit`, `isEmptyObject`, `sortObject`, `nullsToUndefined` |
| `pagination` | `getCurrentPage`, `getPageParams`, `getPageLink` |
| `parsers` | `maybeParseJson`, `maybeStringifyJson`, `serialize`, `deserialize` |
| `random` | `getRandomColor`, `getRandomString`, `getRandomNumber`, `getRandomElement` |
| `string` | `ucFirst`, `lcFirst`, `stripHtml`, `getExcerpt`, `slugify`, `getInitials`, `joinAsSentence` |
| `time` | `formatDate`, `formatTime`, `formatDateTime`, `formatDateOrTime`, `formatDateRange`, `getReadTime` |

> Some utilities (`dom`, `events`, `toBase64`, `setInputValue`) rely on browser APIs and are only usable in the browser.

### Dates and time zones

The date helpers accept any `Intl.DateTimeFormat` option plus a `locale` (defaults to `"en-US"`). Without a `timeZone`, they format in the time zone of the machine that runs them. On server-rendered pages, the server (often UTC) and the browser (the visitor's zone) can then produce different text, which causes React hydration errors. Pass a fixed `timeZone` to get the same output in both places:

```ts
import { formatDate, formatDateRange } from "@dirstack/utils"

formatDate("2026-10-05T23:30:00Z", { dateStyle: "long", timeZone: "UTC", locale: "en-GB" }) // "5 October 2026"
formatDate("2026-10-05", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) // "Oct 05, 2026"
formatDateRange("2026-10-05", "2026-10-09", { timeZone: "UTC" }) // "Oct 5 – 9, 2026"
```

Date-only strings such as `"2026-10-05"` parse as UTC midnight, so format them with `timeZone: "UTC"` to keep the same calendar day everywhere. The positional form (`formatDate(date, "long", "en-GB")`) still works.

## Development

```bash
bun install      # install dependencies
bun test         # run the test suite
bun run typecheck
bun run build    # bundle + emit type declarations
```

## License

MIT © [Piotr Kulpinski](https://kulpinski.pl)
