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
| `time` | `formatDate`, `formatTime`, `formatDateTime`, `formatDateRange`, `getReadTime` |

> Some utilities (`dom`, `events`, `toBase64`, `setInputValue`) rely on browser APIs and are only usable in the browser.

## Development

```bash
bun install      # install dependencies
bun test         # run the test suite
bun run typecheck
bun run build    # bundle + emit type declarations
```

## License

MIT © [Piotr Kulpinski](https://kulpinski.pl)
