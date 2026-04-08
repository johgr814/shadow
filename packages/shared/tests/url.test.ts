import { describe, expect, it } from 'vitest';
import { FileName } from '../src/fileName.js';
import { ContentTypeHeader, ShadowGitUrlHeader } from '../src/httpHeaders.js';
import { GitStorage } from '../src/storage.js';
import { Url } from '../src/url.js';

const storage = GitStorage.of('http://localhost:7000/instances');

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

describe('GitStorage.surlFromRequest', () => {
  it('creates surl from request url pathname', () => {
    const request = new Request('http://localhost:3000/my-resource');
    const surl = storage.surlFromRequest(request);
    expect(surl.toString()).toBe('/my-resource');
  });

  it('creates surl with root pathname', () => {
    const request = new Request('http://localhost:3000/');
    expect(storage.surlFromRequest(request).toString()).toBe('/');
  });

  it('extracts content-type header from request', () => {
    const request = new Request('http://localhost:3000/foo', {
      headers: {
        'content-type': 'text/html',
        'x-shadow-git-url': 'http://localhost:7000/instances',
      },
    });
    const surl = storage.surlFromRequest(request);
    expect(surl.toString()).toBe('/foo');
  });
});

describe('GitStorage.surlFromFileName', () => {
  it('creates surl from fileName', () => {
    const fileName = FileName.of('my-config');
    const url = Url.of('http://localhost:3000', '/', null, null);
    const surl = storage.surlFromFileName(fileName, url);
    expect(surl.toString()).toBe('my-config');
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
