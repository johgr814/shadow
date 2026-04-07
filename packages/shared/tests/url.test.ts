import { describe, expect, it } from 'vitest';
import { ContentTypeHeader, ShadowGitUrlHeader } from '../src/httpHeaders.js';
import { Surl, Url } from '../src/url.js';

describe('Url', () => {
  it('wraps a valid path with null headers', () => {
    const url = Url.of('/foo', null, null);
    expect(url.toString()).toBe('/foo');
    expect(url.contentType).toBeNull();
    expect(url.shadowGitUrl).toBeNull();
  });

  it('carries Content-Type header', () => {
    const ct = ContentTypeHeader.of('application/json');
    const url = Url.of('/api', ct, null);
    expect(url.contentType?.toString()).toBe('application/json');
  });

  it('carries X-Shadow-Git-URL header', () => {
    const gitUrl = ShadowGitUrlHeader.of('https://github.com/org/repo');
    const url = Url.of('/api', null, gitUrl);
    expect(url.shadowGitUrl?.toString()).toBe('https://github.com/org/repo');
  });

  it('throws when path does not start with /', () => {
    expect(() => Url.of('no-slash', null, null)).toThrow(
      "Url must start with '/'",
    );
  });
});

describe('Surl', () => {
  it('wraps a valid name with null headers', () => {
    const surl = Surl.of('my-resource', null, null);
    expect(surl.toString()).toBe('my-resource');
    expect(surl.contentType).toBeNull();
    expect(surl.shadowGitUrl).toBeNull();
  });

  it('carries Content-Type header', () => {
    const ct = ContentTypeHeader.of('text/plain');
    const surl = Surl.of('my-resource', ct, null);
    expect(surl.contentType?.toString()).toBe('text/plain');
  });

  it('carries X-Shadow-Git-URL header', () => {
    const gitUrl = ShadowGitUrlHeader.of('https://github.com/org/repo');
    const surl = Surl.of('my-resource', null, gitUrl);
    expect(surl.shadowGitUrl?.toString()).toBe('https://github.com/org/repo');
  });

  it('throws on empty string', () => {
    expect(() => Surl.of('', null, null)).toThrow('Surl must not be empty');
  });

  it('throws on whitespace-only string', () => {
    expect(() => Surl.of('   ', null, null)).toThrow('Surl must not be empty');
  });
});
