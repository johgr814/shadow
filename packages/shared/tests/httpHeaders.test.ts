import { describe, expect, it } from 'vitest';
import { ContentTypeHeader, ShadowGitUrlHeader } from '../src/httpHeaders.js';

describe('ContentTypeHeader', () => {
  it('wraps a valid content-type value', () => {
    const header = ContentTypeHeader.of('application/json');
    expect(header.toString()).toBe('application/json');
  });

  it('trims surrounding whitespace', () => {
    const header = ContentTypeHeader.of('  text/html  ');
    expect(header.toString()).toBe('text/html');
  });

  it('throws on empty string', () => {
    expect(() => ContentTypeHeader.of('')).toThrow(
      'Content-Type header must not be empty',
    );
  });

  it('throws on whitespace-only string', () => {
    expect(() => ContentTypeHeader.of('   ')).toThrow(
      'Content-Type header must not be empty',
    );
  });
});

describe('ShadowGitUrlHeader', () => {
  it('wraps a valid X-Shadow-Git-URL value', () => {
    const header = ShadowGitUrlHeader.of('https://github.com/org/repo');
    expect(header.toString()).toBe('https://github.com/org/repo');
  });

  it('trims surrounding whitespace', () => {
    const header = ShadowGitUrlHeader.of('  https://github.com/org/repo  ');
    expect(header.toString()).toBe('https://github.com/org/repo');
  });

  it('throws on empty string', () => {
    expect(() => ShadowGitUrlHeader.of('')).toThrow(
      'X-Shadow-Git-URL header must not be empty',
    );
  });

  it('throws on whitespace-only string', () => {
    expect(() => ShadowGitUrlHeader.of('   ')).toThrow(
      'X-Shadow-Git-URL header must not be empty',
    );
  });
});
