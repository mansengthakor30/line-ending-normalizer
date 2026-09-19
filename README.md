# Line Ending Normalizer

Converts text between LF, CRLF, and CR line ending conventions, with detection and reporting.

```js
import {
  detectLineEnding,
  normalizeLineEndings,
  countLineEndings,
  LineEnding,
} from './src/index.js';

const text = 'first\r\nsecond\nthird\r';

console.log(detectLineEnding(text)); // 'CRLF'
console.log(normalizeLineEndings(text, LineEnding.LF)); // 'first\nsecond\nthird\n'
console.log(countLineEndings(text)); // { LF: 1, CRLF: 1, CR: 1 }
```

## Why this exists

Text files on different operating systems use different byte sequences for line breaks: LF on Unix, CRLF on Windows, and CR on older Mac systems. When moving files between systems or processing user input, mixed line endings cause parsers, diff tools, and linters to behave inconsistently.

This library provides a single, small set of functions to identify the dominant convention and normalize any mixture to one target. The trade-off made here is simplicity over exhaustive statistical analysis: `detectLineEnding` returns the first convention encountered rather than the most frequent one. This is fast, deterministic, and predictable for callers who just need a quick answer.

## Edge case

A string with no line endings at all returns `null` from `detectLineEnding`. Callers that need a default should handle `null` explicitly instead of guessing LF.

## API

- `detectLineEnding(text: string): LineEnding | null` — returns the first line ending convention found, or `null` if none exists.
- `normalizeLineEndings(text: string, target?: LineEnding): string` — replaces every line ending with the target convention (defaults to LF).
- `countLineEndings(text: string): { LF: number, CRLF: number, CR: number }` — counts occurrences of each convention; CRLF counts as one, not as both LF and CR.
- `LineEnding` — frozen object with `LF`, `CRLF`, and `CR` string values.
