import git from 'isomorphic-git';
import { createFsFromVolume, vol } from 'memfs';
import { beforeEach, describe, expect, it } from 'vitest';
import { TemplateBody } from '../src/resource.js';
import { GitStorage } from '../src/storage.js';
import { Surl } from '../src/url.js';

beforeEach(async () => {
  vol.reset();
  vol.mkdirSync('/instances', { recursive: true });
  await git.init({ fs: createFsFromVolume(vol), dir: '/instances' });
});

describe('GitStorage', () => {
  it('lists no resources on a fresh instance', () => {
    const storage = new GitStorage();
    const resources = storage.listResources();
    expect(resources).toEqual([]);
  });

  it('saves a resource and lists it', async () => {
    const storage = new GitStorage();
    const surl = Surl.of('my-template', null, null);
    const body = TemplateBody.of('Hello {{name}}!');
    await storage.saveResource(surl, { name: surl, body });
    const resources = storage.listResources();
    expect(resources).toContain('my-template');
  });

  it('saves multiple resources and lists all', async () => {
    const storage = new GitStorage();
    const surl1 = Surl.of('template-a', null, null);
    const surl2 = Surl.of('template-b', null, null);
    await storage.saveResource(surl1, {
      name: surl1,
      body: TemplateBody.of('A'),
    });
    await storage.saveResource(surl2, {
      name: surl2,
      body: TemplateBody.of('B'),
    });
    const resources = storage.listResources();
    expect(resources).toContain('template-a');
    expect(resources).toContain('template-b');
  });

  it('query returns content with the given surl', () => {
    const storage = new GitStorage();
    const surl = Surl.of('some-resource', null, null);
    const content = storage.query(surl);
    expect(content.surl.toString()).toBe('some-resource');
  });
});
