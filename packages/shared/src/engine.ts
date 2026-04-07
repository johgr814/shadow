import type { HtmlRenderer } from './htmlRenderer.js';
import type { IEngine, RequestBody } from './interfaces.js';
import type { HttpMethod } from './interfaces.js';
import { TemplateBody } from './resource.js';
import type { IResponse } from './response.js';
import { ContentType, RedirectLocation, Response } from './response.js';
import type { GitStorage } from './storage.js';
import { Surl, type Url } from './url.js';

export class Engine implements IEngine {
  private constructor(
    private readonly storage: GitStorage,
    private readonly renderer: HtmlRenderer,
  ) {}

  static of(storage: GitStorage, renderer: HtmlRenderer): Engine {
    return new Engine(storage, renderer);
  }

  async handle(
    url: Url,
    method: HttpMethod,
    body: RequestBody | null,
  ): Promise<IResponse> {
    const path = url.toString();

    if (path === '/new-resource' && method.isGet()) {
      return Response.ok(
        this.renderer.renderNewResource({ errors: [] }),
        ContentType.HTML,
      );
    }

    if (path === '/' && method.isPost()) {
      return this.handlePost(body);
    }

    return this.handleGet();
  }

  private async handlePost(body: RequestBody | null): Promise<IResponse> {
    const params = parseFormBody(body);
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
      return Response.badRequest(this.renderer.renderNewResource({ errors }));
    }

    const surl = Surl.of(rawName as string);
    const templateBody = TemplateBody.of(rawBody as string);

    await this.storage.saveResource(surl, { name: surl, body: templateBody });

    return Response.redirect(RedirectLocation.of('/'));
  }

  private handleGet(): IResponse {
    const resources = this.storage.listResources();
    return Response.ok(
      this.renderer.renderIndex({ resources }),
      ContentType.HTML,
    );
  }
}

function parseFormBody(body: RequestBody | null): Map<string, string> {
  const map = new Map<string, string>();
  if (body === null) {
    return map;
  }
  const raw = body.toString();
  for (const pair of raw.split('&')) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) continue;
    const key = decodeURIComponent(pair.slice(0, eqIdx).replace(/\+/g, ' '));
    const value = decodeURIComponent(pair.slice(eqIdx + 1).replace(/\+/g, ' '));
    map.set(key, value);
  }
  return map;
}
