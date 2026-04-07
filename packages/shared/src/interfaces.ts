import type { IContent } from './content.js';
import type { IResource, IResourceTemplate } from './resource.js';
import type { Surl, Url } from './url.js';

export interface IRouter {
  resolve(url: Url): IContent;
}

export interface IStorage {
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

export interface IConfig {
  readonly router: IRouter;
  readonly storage: IStorage;
  readonly engine: IEngine;
}

export interface IResourceList {
  readonly resources: ReadonlyArray<IResource>;
}
