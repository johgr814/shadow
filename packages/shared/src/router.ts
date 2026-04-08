import type { IContent } from './content.js';
import type { IRouter } from './interfaces.js';
import { Surl } from './surl.js';
import type { Url } from './url.js';

export class Router implements IRouter {
  private constructor() {}

  static of(): Router {
    return new Router();
  }

  resolve(url: Url): IContent {
    return { surl: Surl.fromUrl(url) };
  }
}
