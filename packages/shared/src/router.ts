import type { IContent } from './content.js';
import type { IRouter } from './interfaces.js';
import type { GitStorage } from './storage.js';
import type { Url } from './url.js';
import { Surl } from './url.js';

export class Router implements IRouter {
  private constructor(private readonly storage: GitStorage) {}

  static of(storage: GitStorage): Router {
    return new Router(storage);
  }

  resolve(url: Url): IContent {
    return this.storage.query(Surl.of(url.toString()));
  }
}
