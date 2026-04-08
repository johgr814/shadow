import { describe, expect, it } from 'vitest';
import { FileName } from '../src/fileName.js';
import { MimeType } from '../src/mimeType.js';
import { TemplateBody } from '../src/resource.js';
import { GitStorage } from '../src/storage.js';
import { Surl } from '../src/surl.js';
import { Url } from '../src/url.js';

const REMOTE_URL = 'http://localhost:7000/e2e';
const BASE_URL = 'http://localhost:3000';

function fileNameFor(name: string): FileName {
  return FileName.of(name);
}

function surlFor(name: string): Surl {
  return Surl.NewResourceUrl(
    FileName.of(name),
    Url.of(BASE_URL, '/', null, null),
  );
}

describe('GitStorage', () => {
  it('rejects empty remoteUrl', () => {
    expect(() => GitStorage.of('')).toThrow('GitServerUrl must not be empty');
  });

  it('exposes the remoteUrl', () => {
    const storage = GitStorage.of(REMOTE_URL);
    expect(storage.remoteUrl.toString()).toBe(REMOTE_URL);
  });

  it('lists no resources on a fresh instance', () => {
    const storage = GitStorage.of(REMOTE_URL);
    expect(storage.listResources()).toEqual([]);
  });

  it('saves a resource and lists it', async () => {
    const storage = GitStorage.of(REMOTE_URL);
    const surl = surlFor('my-template');
    await storage.saveResource(surl, {
      fileName: fileNameFor('my-template'),
      mimeType: MimeType.of('text/plain'),
      body: TemplateBody.of('Hello {{name}}!'),
    });
    expect(storage.listResources()).toContain('my-template');
  });

  it('saves multiple resources and lists all', async () => {
    const storage = GitStorage.of(REMOTE_URL);
    await storage.saveResource(surlFor('template-a'), {
      fileName: fileNameFor('template-a'),
      mimeType: MimeType.of('text/plain'),
      body: TemplateBody.of('A'),
    });
    await storage.saveResource(surlFor('template-b'), {
      fileName: fileNameFor('template-b'),
      mimeType: MimeType.of('text/plain'),
      body: TemplateBody.of('B'),
    });
    const resources = storage.listResources();
    expect(resources).toContain('template-a');
    expect(resources).toContain('template-b');
  });

  it('query returns content with the given surl', () => {
    const storage = GitStorage.of(REMOTE_URL);
    const surl = surlFor('some-resource');
    const content = storage.query(surl);
    expect(content.surl.toString()).toBe('some-resource');
  });

  it('two instances are fully isolated', async () => {
    const storage1 = GitStorage.of(REMOTE_URL);
    const storage2 = GitStorage.of(REMOTE_URL);
    await storage1.saveResource(surlFor('only-in-1'), {
      fileName: fileNameFor('only-in-1'),
      mimeType: MimeType.of('text/plain'),
      body: TemplateBody.of('X'),
    });
    expect(storage1.listResources()).toContain('only-in-1');
    expect(storage2.listResources()).not.toContain('only-in-1');
  });
});
