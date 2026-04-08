import type { IContent } from './content.js';
import type { GitServerUrl } from './gitServerUrl.js';
import type { RenderedHtml } from './renderedHtml.js';
import type { IResource, IResourceTemplate } from './resource.js';
import type { Surl } from './surl.js';
import type { Url } from './url.js';

export interface IRouter {
  resolve(url: Url): IContent;
}

export interface IStorage {
  readonly remoteUrl: GitServerUrl;
  query(surl: Surl): IContent;
  saveResource(surl: Surl, def: IResourceTemplate): Promise<void>;
  listResources(): ReadonlyArray<string>;
}

export interface IEngine {
  handle(request: Request): Promise<Response>;
}

export interface IBackend {
  start(): Promise<void>;
}

export interface IHtmlRenderer {
  renderIndex(viewModel: {
    readonly resources: ReadonlyArray<string>;
  }): RenderedHtml;
  renderNewResource(viewModel: {
    readonly errors: ReadonlyArray<string>;
  }): RenderedHtml;
}

export interface IConfig {
  readonly router: IRouter;
  readonly engine: IEngine;
  readonly gitServerUrl: GitServerUrl;
}

export interface IResourceList {
  readonly resources: ReadonlyArray<IResource>;
}
