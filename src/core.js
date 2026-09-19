/**
 * Line ending conventions supported by this library.
 *
 * Using a string union keeps the public API small and readable while
 * still giving TypeScript users autocomplete and type safety.
 *
 * @typedef {'LF' | 'CRLF' | 'CR'} LineEnding
 */

/**
 * Represents the normalized line ending to use.
 *
 * Kept as a plain object with the three supported values so callers can
 * pass `LineEnding.LF` rather than a raw string. A frozen object prevents
 * accidental mutation.
 */
export const LineEnding = Object.freeze({
  LF: 'LF',
  CRLF: 'CRLF',
  CR: 'CR',
});

const LINE_ENDING_SEQUENCES = {
  [LineEnding.LF]: '\n',
  [LineEnding.CRLF]: '\r\n',
  [LineEnding.CR]: '\r',
};

/**
 * Detect the dominant line ending convention in a string.
 *
 * Detection is based on the first line ending encountered while scanning
 * from left to right. This is deterministic and cheap: we do not need to
 * count every occurrence to answer the question "what convention does this
 * text use?" for normalizer callers.
 *
 * If no line ending is present, we return null rather than guessing. This
 * avoids silently treating a one-line string as LF when it could equally
 * be CRLF or CR.
 *
 * @param {string} text
 * @returns {LineEnding | null}
 */
export function detectLineEnding(text) {
  if (typeof text !== 'string') {
    throw new TypeError('text must be a string');
  }

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '\r') {
      // CRLF is two characters; check the next one before deciding.
      return text[i + 1] === '\n' ? LineEnding.CRLF : LineEnding.CR;
    }

    if (char === '\n') {
      return LineEnding.LF;
    }
  }

  return null;
}

/**
 * Normalize all line endings in a string to a single convention.
 *
 * The algorithm walks the input once and replaces any recognized line
 * ending sequence with the target sequence. Lone `\r` and lone `\n` are
 * both treated as line endings, and a `\r\n` pair is treated as one unit.
 *
 * @param {string} text
 * @param {LineEnding} [target=LineEnding.LF]
 * @returns {string}
 */
export function normalizeLineEndings(text, target = LineEnding.LF) {
  if (typeof text !== 'string') {
    throw new TypeError('text must be a string');
  }

  if (!Object.prototype.hasOwnProperty.call(LINE_ENDING_SEQUENCES, target)) {
    throw new TypeError(
      `target must be one of ${Object.values(LineEnding).join(', ')}`,
    );
  }

  const replacement = LINE_ENDING_SEQUENCES[target];
  let result = '';

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '\r') {
      if (text[i + 1] === '\n') {
        result += replacement;
        i += 1; // skip the LF in CRLF
      } else {
        result += replacement;
      }
    } else if (char === '\n') {
      result += replacement;
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Count occurrences of each line ending convention in a string.
 *
 * CRLF counts as one CRLF occurrence and does not also increment LF or CR
 * counts. This matches the way users think about line endings in text
 * files: a Windows line break is one thing, not two.
 *
 * @param {string} text
 * @returns {{ LF: number, CRLF: number, CR: number }}
 */
export function countLineEndings(text) {
  if (typeof text !== 'string') {
    throw new TypeError('text must be a string');
  }

  const counts = {
    LF: 0,
    CRLF: 0,
    CR: 0,
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '\r') {
      if (text[i + 1] === '\n') {
        counts.CRLF += 1;
        i += 1;
      } else {
        counts.CR += 1;
      }
    } else if (char === '\n') {
      counts.LF += 1;
    }
  }

  return counts;
}
