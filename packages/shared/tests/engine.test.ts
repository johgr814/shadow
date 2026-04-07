import git from 'isomorphic-git';
import { createFsFromVolume, vol } from 'memfs';
import { beforeEach, describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';
import { HtmlRenderer } from '../src/htmlRenderer.js';
import { GitStorage } from '../src/storage.js';

function makeEngine(): Engine {
  return Engine.of(new GitStorage(), new HtmlRenderer());
}

beforeEach(async () => {
  vol.reset();
  vol.mkdirSync('/instances', { recursive: true });
  await git.init({ fs: createFsFromVolume(vol), dir: '/instances' });
});

describe('Engine', () => {
  describe('GET /', () => {
    it('returns 200 with index html', async () => {
      const engine = makeEngine();
      const request = new Request('http://localhost/');
      const response = await engine.handle(request);
      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toContain('<h1>Shadow</h1>');
    });

    it('shows no-resources message when storage is empty', async () => {
      const engine = makeEngine();
      const request = new Request('http://localhost/');
      const response = await engine.handle(request);
      const body = await response.text();
      expect(body).toContain('No resources yet');
    });
  });

  describe('GET /new-resource', () => {
    it('returns 200 with new resource form', async () => {
      const engine = makeEngine();
      const request = new Request('http://localhost/new-resource');
      const response = await engine.handle(request);
      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toContain('<h1>New Resource</h1>');
    });
  });

  describe('POST /', () => {
    it('returns 303 redirect to / on valid submission', async () => {
      const engine = makeEngine();
      const request = new Request('http://localhost/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'name=my-resource&body=Hello+%7B%7Bname%7D%7D',
      });
      const response = await engine.handle(request);
      expect(response.status).toBe(303);
      expect(response.headers.get('Location')).toBe('/');
    });

    it('returns 400 with errors when name is missing', async () => {
      const engine = makeEngine();
      const request = new Request('http://localhost/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'name=&body=Hello',
      });
      const response = await engine.handle(request);
      expect(response.status).toBe(400);
      const body = await response.text();
      expect(body).toContain('Resource name is required');
    });

    it('returns 400 with errors when body is missing', async () => {
      const engine = makeEngine();
      const request = new Request('http://localhost/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'name=my-resource&body=',
      });
      const response = await engine.handle(request);
      expect(response.status).toBe(400);
      const body = await response.text();
      expect(body).toContain('Template body is required');
    });

    it('returns 400 when both fields are missing', async () => {
      const engine = makeEngine();
      const request = new Request('http://localhost/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: '',
      });
      const response = await engine.handle(request);
      expect(response.status).toBe(400);
      const body = await response.text();
      expect(body).toContain('Resource name is required');
      expect(body).toContain('Template body is required');
    });

    it('saved resource appears on index after redirect', async () => {
      const storage = new GitStorage();
      const engine = Engine.of(storage, new HtmlRenderer());
      const postRequest = new Request('http://localhost/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'name=my-config&body=%7B%7B!+config+%7D%7D',
      });
      await engine.handle(postRequest);
      const getRequest = new Request('http://localhost/');
      const response = await engine.handle(getRequest);
      const body = await response.text();
      expect(body).toContain('my-config');
    });
  });
});
