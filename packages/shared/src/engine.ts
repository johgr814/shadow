import { FileName } from './fileName.js';
import type { IEngine, IHtmlRenderer } from './interfaces.js';
import { MimeType } from './mimeType.js';
import { TemplateBody } from './resource.js';
import { GitStorage } from './storage.js';
import { Url } from './url.js';

export class Engine implements IEngine {
  private readonly storageCache = new Map<string, GitStorage>();

  private constructor(private readonly renderer: IHtmlRenderer) {}

  static of(renderer: IHtmlRenderer): Engine {
    return new Engine(renderer);
  }

  private storageFromRequest(request: Request): GitStorage {
    const gitUrl = request.headers.get('x-shadow-git-url');
    if (!gitUrl) {
      throw new Error('Missing X-Shadow-Git-URL header');
    }
    const cached = this.storageCache.get(gitUrl);
    if (cached !== undefined) {
      return cached;
    }
    const storage = GitStorage.of(gitUrl);
    this.storageCache.set(gitUrl, storage);
    return storage;
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

    return this.handleGet(this.storageFromRequest(request));
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

    const storage = this.storageFromRequest(request);
    const surl = storage.surlFromFileName(fileName, requestUrl);
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

  private handleGet(storage: GitStorage): Response {
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
