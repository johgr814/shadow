import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';
import { HtmlRenderer } from '../src/htmlRenderer.js';

const GIT_URL = 'http://localhost:7000/e2e';

function makeEngine(): Engine {
  return Engine.of(new HtmlRenderer());
}

function makeRequest(path: string, options?: RequestInit): Request {
  return new Request(`http://localhost${path}`, {
    ...options,
    headers: {
      'x-shadow-git-url': GIT_URL,
      ...(options?.headers as Record<string, string> | undefined),
    },
  });
}

describe('Engine', () => {
  describe('GET /', () => {
    it('returns 200 with index html', async () => {
      const engine = makeEngine();
      const response = await engine.handle(makeRequest('/'));
      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toContain('<h1>Shadow</h1>');
    });

    it('shows no-resources message when storage is empty', async () => {
      const engine = makeEngine();
      const response = await engine.handle(makeRequest('/'));
      const body = await response.text();
      expect(body).toContain('No resources yet');
    });
  });

  describe('GET /new-resource', () => {
    it('returns 200 with new resource form', async () => {
      const engine = makeEngine();
      const response = await engine.handle(makeRequest('/new-resource'));
      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toContain('<h1>New Resource</h1>');
    });
  });

  describe('POST /', () => {
    it('returns 303 redirect to / on valid submission', async () => {
      const engine = makeEngine();
      const response = await engine.handle(
        makeRequest('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'name=my-resource&mimeType=text%2Fplain&body=Hello+%7B%7Bname%7D%7D',
        }),
      );
      expect(response.status).toBe(303);
      expect(response.headers.get('Location')).toBe('/');
    });

    it('returns 400 with errors when name is missing', async () => {
      const engine = makeEngine();
      const response = await engine.handle(
        makeRequest('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'name=&mimeType=text%2Fplain&body=Hello',
        }),
      );
      expect(response.status).toBe(400);
      const body = await response.text();
      expect(body).toContain('Resource name is required');
    });

    it('returns 400 with errors when body is missing', async () => {
      const engine = makeEngine();
      const response = await engine.handle(
        makeRequest('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'name=my-resource&mimeType=text%2Fplain&body=',
        }),
      );
      expect(response.status).toBe(400);
      const body = await response.text();
      expect(body).toContain('Template body is required');
    });

    it('returns 400 when both fields are missing', async () => {
      const engine = makeEngine();
      const response = await engine.handle(
        makeRequest('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: '',
        }),
      );
      expect(response.status).toBe(400);
      const body = await response.text();
      expect(body).toContain('Resource name is required');
      expect(body).toContain('MIME type is required');
      expect(body).toContain('Template body is required');
    });
    it('saved resource appears on index after redirect', async () => {
      const engine = makeEngine();
      await engine.handle(
        makeRequest('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'name=my-config&mimeType=text%2Fplain&body=%7B%7B!+config+%7D%7D',
        }),
      );
      const response = await engine.handle(makeRequest('/'));
      const body = await response.text();
      expect(body).toContain('my-config');
    });
  });
});
