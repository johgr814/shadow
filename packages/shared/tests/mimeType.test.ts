import { describe, expect, it } from 'vitest';
import { MimeType } from '../src/mimeType.js';

describe('MimeType', () => {
  it('wraps a known mime type', () => {
    const mt = MimeType.of('text/plain');
    expect(mt.toString()).toBe('text/plain');
  });

  it('normalizes a known mime type with charset by stripping parameters', () => {
    const mt = MimeType.of('text/html');
    expect(mt.toString()).toBe('text/html');
  });

  it('trims surrounding whitespace', () => {
    const mt = MimeType.of('  application/json  ');
    expect(mt.toString()).toBe('application/json');
  });

  it('throws on empty string', () => {
    expect(() => MimeType.of('')).toThrow('MimeType must not be empty');
  });

  it('throws on whitespace-only string', () => {
    expect(() => MimeType.of('   ')).toThrow('MimeType must not be empty');
  });

  it('throws on invalid mime type string without slash', () => {
    expect(() => MimeType.of('textplain')).toThrow(
      'MimeType is not a valid mime type: textplain',
    );
  });
});
