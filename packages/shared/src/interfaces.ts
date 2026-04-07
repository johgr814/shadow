import type { IContent } from './content.js';
import type { IResource, IResourceTemplate } from './resource.js';
import type { IResponse } from './response.js';
import type { Surl, Url } from './url.js';

export interface IRouter {
  resolve(url: Url): IContent;
}

export interface IStorage {
  query(surl: Surl): IContent;
  saveResource(surl: Surl, def: IResourceTemplate): Promise<void>;
}

export interface IEngine {
  handle(
    url: Url,
    method: HttpMethod,
    body: RequestBody | null,
  ): Promise<IResponse>;
}

export interface IBackend {
  start(): Promise<void>;
}

export interface IConfig {
  readonly router: IRouter;
  readonly storage: IStorage;
  readonly engine: IEngine;
  readonly instancesDir: InstancesDir;
}

export class HttpMethod {
  private constructor(private readonly value: string) {}

  static of(value: string): HttpMethod {
    const upper = value.toUpperCase();
    if (upper !== 'GET' && upper !== 'POST') {
      throw new Error(`Unsupported HTTP method: ${value}`);
    }
    return new HttpMethod(upper);
  }

  static readonly GET = HttpMethod.of('GET');
  static readonly POST = HttpMethod.of('POST');

  isPost(): boolean {
    return this.value === 'POST';
  }

  isGet(): boolean {
    return this.value === 'GET';
  }

  toString(): string {
    return this.value;
  }
}

export class RequestBody {
  private constructor(private readonly value: string) {}

  static of(value: string): RequestBody {
    return new RequestBody(value);
  }

  toString(): string {
    return this.value;
  }
}

export class InstancesDir {
  private constructor(private readonly value: string) {}

  static of(value: string): InstancesDir {
    if (!value || value.trim().length === 0) {
      throw new Error('InstancesDir must not be empty');
    }
    return new InstancesDir(value);
  }

  toString(): string {
    return this.value;
  }
}

export interface IResourceList {
  readonly resources: ReadonlyArray<IResource>;
}
