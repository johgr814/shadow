import type { IContent } from './content.js';
import type { FileName } from './fileName.js';
import type { GitServerUrl } from './gitServerUrl.js';
import type { RenderedHtml } from './renderedHtml.js';
import type { IResource, IResourceTemplate } from './resource.js';
import type { Url } from './url.js';

export interface ISurl {
  readonly _brand?: never;
}

export interface IRouter {
  resolve(request: Request): IContent;
}

export interface IStorage {
  readonly remoteUrl: GitServerUrl;
  surlFromRequest(request: Request): ISurl;
  surlFromFileName(fileName: FileName, url: Url): ISurl;
  query(surl: ISurl): IContent;
  saveResource(surl: ISurl, def: IResourceTemplate): Promise<void>;
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
