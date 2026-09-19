import test from 'node:test';
import assert from 'node:assert/strict';

import {
  detectLineEnding,
  normalizeLineEndings,
  countLineEndings,
  LineEnding,
} from '../src/index.js';

test('detectLineEnding returns LF for LF-only text', () => {
  assert.equal(detectLineEnding('hello\nworld'), LineEnding.LF);
});

test('detectLineEnding returns CRLF for CRLF-only text', () => {
  assert.equal(detectLineEnding('hello\r\nworld'), LineEnding.CRLF);
});

test('detectLineEnding returns CR for CR-only text', () => {
  assert.equal(detectLineEnding('hello\rworld'), LineEnding.CR);
});

test('detectLineEnding returns null when no line ending exists', () => {
  assert.equal(detectLineEnding('hello world'), null);
});

test('detectLineEnding returns the first convention when mixed', () => {
  assert.equal(detectLineEnding('one\r\ntwo\nthree'), LineEnding.CRLF);
});

test('normalizeLineEndings converts LF to LF by default', () => {
  assert.equal(
    normalizeLineEndings('a\nb\nc'),
    'a\nb\nc',
  );
});

test('normalizeLineEndings converts CRLF to LF when target is LF', () => {
  assert.equal(
    normalizeLineEndings('a\r\nb\r\nc', LineEnding.LF),
    'a\nb\nc',
  );
});

test('normalizeLineEndings handles mixed line endings', () => {
  const input = 'a\r\nb\rc\nd';
  assert.equal(
    normalizeLineEndings(input, LineEnding.LF),
    'a\nb\nc\nd',
  );
});

test('normalizeLineEndings converts to CR', () => {
  assert.equal(
    normalizeLineEndings('a\nb\r\nc', LineEnding.CR),
    'a\rb\rc',
  );
});

test('normalizeLineEndings leaves text without line endings unchanged', () => {
  assert.equal(
    normalizeLineEndings('no endings here', LineEnding.CRLF),
    'no endings here',
  );
});

test('normalizeLineEndings throws on non-string text', () => {
  assert.throws(
    () => normalizeLineEndings(123),
    TypeError,
  );
});

test('normalizeLineEndings throws on invalid target', () => {
  assert.throws(
    () => normalizeLineEndings('text', 'INVALID'),
    TypeError,
  );
});

test('countLineEndings counts LF correctly', () => {
  assert.deepEqual(
    countLineEndings('a\nb\nc'),
    { LF: 2, CRLF: 0, CR: 0 },
  );
});

test('countLineEndings counts CRLF as one unit', () => {
  assert.deepEqual(
    countLineEndings('a\r\nb\r\nc'),
    { LF: 0, CRLF: 2, CR: 0 },
  );
});

test('countLineEndings counts mixed endings separately', () => {
  assert.deepEqual(
    countLineEndings('a\nb\r\nc\rd'),
    { LF: 1, CRLF: 1, CR: 1 },
  );
});

test('countLineEndings returns zeros for text without endings', () => {
  assert.deepEqual(
    countLineEndings('plain text'),
    { LF: 0, CRLF: 0, CR: 0 },
  );
});

test('countLineEndings throws on non-string input', () => {
  assert.throws(
    () => countLineEndings(null),
    TypeError,
  );
});
