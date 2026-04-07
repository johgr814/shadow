import { ContentTypeHeader, ShadowGitUrlHeader } from './httpHeaders.js';
import type { IEngine, IHtmlRenderer, IStorage } from './interfaces.js';
import { TemplateBody } from './resource.js';
import { Surl } from './url.js';

export class Engine implements IEngine {
  private constructor(
    private readonly storage: IStorage,
    private readonly renderer: IHtmlRenderer,
  ) {}

  static of(storage: IStorage, renderer: IHtmlRenderer): Engine {
    return new Engine(storage, renderer);
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

    return this.handleGet();
  }

  private async handlePost(request: Request): Promise<Response> {
    const rawContentType = request.headers.get('content-type');
    const rawShadowGitUrl = request.headers.get('x-shadow-git-url');

    const contentType =
      rawContentType != null ? ContentTypeHeader.of(rawContentType) : null;
    const shadowGitUrl =
      rawShadowGitUrl != null ? ShadowGitUrlHeader.of(rawShadowGitUrl) : null;

    const bodyText = await request.text();
    const params = parseFormBody(bodyText);
    const errors: string[] = [];

    const rawName = params.get('name');
    const rawBody = params.get('body');

    if (!rawName || rawName.trim().length === 0) {
      errors.push('Resource name is required');
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

    const surl = Surl.of(rawName as string, contentType, shadowGitUrl);
    const templateBody = TemplateBody.of(rawBody as string);

    await this.storage.saveResource(surl, { name: surl, body: templateBody });

    return new Response(null, {
      status: 303,
      headers: { Location: '/' },
    });
  }

  private handleGet(): Response {
    const resources = this.storage.listResources();
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
