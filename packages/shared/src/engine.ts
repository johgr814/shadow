import { FileName } from './fileName.js';
import { ShadowGitUrlHeader } from './httpHeaders.js';
import type { IEngine, IHtmlRenderer } from './interfaces.js';
import { MimeType } from './mimeType.js';
import { TemplateBody } from './resource.js';
import { GitStorage } from './storage.js';
import { Surl } from './surl.js';
import { Url } from './url.js';

export class Engine implements IEngine {
  private readonly storageCache = new Map<string, GitStorage>();

  private constructor(private readonly renderer: IHtmlRenderer) {}

  static of(renderer: IHtmlRenderer): Engine {
    return new Engine(renderer);
  }

  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    if (path === '/new-resource' && method === 'GET') {
      return new Response(
        this.renderer.renderNewResource({ errors: [] }).toString(),
        {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        },
      );
    }

    if (path === '/' && method === 'POST') {
      return this.handlePost(request);
    }

    return this.handleGet(request);
  }

  private storageFromRequest(request: Request): GitStorage {
    const rawHeader = request.headers.get('x-shadow-git-url');
    if (!rawHeader || rawHeader.trim().length === 0) {
      throw new Error('Missing required header: X-Shadow-Git-URL');
    }
    const shadowGitUrl = ShadowGitUrlHeader.of(rawHeader);
    const key = shadowGitUrl.toString();
    const cached = this.storageCache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    const storage = GitStorage.of(key);
    this.storageCache.set(key, storage);
    return storage;
  }

  private async handlePost(request: Request): Promise<Response> {
    const bodyText = await request.text();
    const params = parseFormBody(bodyText);
    const errors: string[] = [];
    const rawName = params.get('name');
    const rawMimeType = params.get('mimeType');
    const rawBody = params.get('body');

    if (!rawName || rawName.trim().length === 0) {
      errors.push('Resource name is required');
    }
    if (!rawMimeType || rawMimeType.trim().length === 0) {
      errors.push('MIME type is required');
    }
    if (!rawBody || rawBody.trim().length === 0) {
      errors.push('Template body is required');
    }

    if (errors.length > 0) {
      return new Response(
        this.renderer.renderNewResource({ errors }).toString(),
        {
          status: 400,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        },
      );
    }

    const fileName = FileName.of(rawName as string);
    const mimeType = MimeType.of(rawMimeType as string);
    const templateBody = TemplateBody.of(rawBody as string);
    const parsedUrl = new URL(request.url);
    const requestUrl = Url.of(parsedUrl.origin, parsedUrl.pathname, null, null);
    const surl = Surl.NewResourceUrl(fileName, requestUrl);

    const storage = this.storageFromRequest(request);
    await storage.saveResource(surl, {
      fileName,
      mimeType,
      body: templateBody,
    });

    return new Response(null, {
      status: 303,
      headers: { Location: '/' },
    });
  }

  private handleGet(request: Request): Response {
    const storage = this.storageFromRequest(request);
    const resources = storage.listResources();
    return new Response(this.renderer.renderIndex({ resources }).toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

function parseFormBody(raw: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const pair of raw.split('&')) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) continue;
    const key = decodeURIComponent(pair.slice(0, eqIdx).replace(/\+/g, ' '));
    const value = decodeURIComponent(pair.slice(eqIdx + 1).replace(/\+/g, ' '));
    map.set(key, value);
  }
  return map;
}
