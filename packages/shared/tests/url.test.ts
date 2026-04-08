import { describe, expect, it } from 'vitest';
import { FileName } from '../src/fileName.js';
import { ContentTypeHeader, ShadowGitUrlHeader } from '../src/httpHeaders.js';
import { Surl } from '../src/surl.js';
import { Url } from '../src/url.js';

describe('Url', () => {
  it('wraps a valid basePath and path with null headers', () => {
    const url = Url.of('http://localhost:3000', '/foo', null, null);
    expect(url.pathname()).toBe('/foo');
    expect(url.toString()).toBe('http://localhost:3000/foo');
    expect(url.contentType).toBeNull();
    expect(url.shadowGitUrl).toBeNull();
  });

  it('carries Content-Type header', () => {
    const ct = ContentTypeHeader.of('application/json');
    const url = Url.of('http://localhost:3000', '/api', ct, null);
    expect(url.contentType?.toString()).toBe('application/json');
  });

  it('carries X-Shadow-Git-URL header', () => {
    const gitUrl = ShadowGitUrlHeader.of('https://github.com/org/repo');
    const url = Url.of('http://localhost:3000', '/api', null, gitUrl);
    expect(url.shadowGitUrl?.toString()).toBe('https://github.com/org/repo');
  });

  it('throws when path does not start with /', () => {
    expect(() =>
      Url.of('http://localhost:3000', 'no-slash', null, null),
    ).toThrow("Url path must start with '/'");
  });

  it('throws when basePath is empty', () => {
    expect(() => Url.of('', '/foo', null, null)).toThrow(
      'Url basePath must not be empty',
    );
  });

  it('throws when basePath is whitespace-only', () => {
    expect(() => Url.of('   ', '/foo', null, null)).toThrow(
      'Url basePath must not be empty',
    );
  });

  it('pathname returns only the path portion', () => {
    const url = Url.of('http://localhost:3000', '/new-resource', null, null);
    expect(url.pathname()).toBe('/new-resource');
  });
});

describe('Surl.fromUrl', () => {
  it('creates surl from url pathname with null headers', () => {
    const url = Url.of('http://localhost:3000', '/my-resource', null, null);
    const surl = Surl.fromUrl(url);
    expect(surl.toString()).toBe('/my-resource');
    expect(surl.contentType).toBeNull();
    expect(surl.shadowGitUrl).toBeNull();
  });

  it('carries Content-Type header from url', () => {
    const ct = ContentTypeHeader.of('text/plain');
    const url = Url.of('http://localhost:3000', '/my-resource', ct, null);
    const surl = Surl.fromUrl(url);
    expect(surl.contentType?.toString()).toBe('text/plain');
  });

  it('carries X-Shadow-Git-URL header from url', () => {
    const gitUrl = ShadowGitUrlHeader.of('https://github.com/org/repo');
    const url = Url.of('http://localhost:3000', '/my-resource', null, gitUrl);
    const surl = Surl.fromUrl(url);
    expect(surl.shadowGitUrl?.toString()).toBe('https://github.com/org/repo');
  });
});

describe('Surl.fromFileName', () => {
  it('creates surl from fileName with null headers', () => {
    const fileName = FileName.of('my-config');
    const url = Url.of('http://localhost:3000', '/', null, null);
    const surl = Surl.NewResourceUrl(fileName, url);
    expect(surl.toString()).toBe('my-config');
    expect(surl.contentType).toBeNull();
    expect(surl.shadowGitUrl).toBeNull();
  });

  it('carries Content-Type header from url', () => {
    const ct = ContentTypeHeader.of('application/json');
    const fileName = FileName.of('my-config');
    const url = Url.of('http://localhost:3000', '/', ct, null);
    const surl = Surl.NewResourceUrl(fileName, url);
    expect(surl.contentType?.toString()).toBe('application/json');
  });

  it('carries X-Shadow-Git-URL header from url', () => {
    const gitUrl = ShadowGitUrlHeader.of('https://github.com/org/repo');
    const fileName = FileName.of('my-config');
    const url = Url.of('http://localhost:3000', '/', null, gitUrl);
    const surl = Surl.NewResourceUrl(fileName, url);
    expect(surl.shadowGitUrl?.toString()).toBe('https://github.com/org/repo');
  });
});

describe('FileName', () => {
  it('wraps a valid name', () => {
    const fn = FileName.of('my-resource');
    expect(fn.toString()).toBe('my-resource');
  });

  it('trims whitespace', () => {
    const fn = FileName.of('  my-resource  ');
    expect(fn.toString()).toBe('my-resource');
  });

  it('throws on empty string', () => {
    expect(() => FileName.of('')).toThrow('FileName must not be empty');
  });

  it('throws on whitespace-only string', () => {
    expect(() => FileName.of('   ')).toThrow('FileName must not be empty');
  });
});
