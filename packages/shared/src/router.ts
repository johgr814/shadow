import type { IContent } from './content.js';
import type { IRouter, IStorage } from './interfaces.js';

export class Router implements IRouter {
  private constructor(private readonly storage: IStorage) {}

  static of(storage: IStorage): Router {
    return new Router(storage);
  }

  resolve(request: Request): IContent {
    return { surl: this.storage.surlFromRequest(request) };
  }
}
