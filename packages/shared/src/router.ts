import type { IContent } from './content.js';
import type { IRouter, IStorage } from './interfaces.js';
import type { Url } from './url.js';
import { Surl } from './url.js';

export class Router implements IRouter {
  private constructor(private readonly storage: IStorage) {}

  static of(storage: IStorage): Router {
    return new Router(storage);
  }

  resolve(url: Url): IContent {
    return this.storage.query(
      Surl.of(url.toString(), url.contentType, url.shadowGitUrl),
    );
  }
}
