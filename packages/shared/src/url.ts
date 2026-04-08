import type { ContentTypeHeader, ShadowGitUrlHeader } from './httpHeaders.js';

export class Url {
  private constructor(
    private readonly url: URL,
    readonly contentType: ContentTypeHeader | null,
    readonly shadowGitUrl: ShadowGitUrlHeader | null,
  ) {}

  static of(
    basePath: string,
    path: string,
    contentType: ContentTypeHeader | null,
    shadowGitUrl: ShadowGitUrlHeader | null,
  ): Url {
    if (!basePath || basePath.trim().length === 0) {
      throw new Error('Url basePath must not be empty');
    }
    if (!path.startsWith('/')) {
      throw new Error(`Url path must start with '/': ${path}`);
    }
    return new Url(new URL(path, basePath), contentType, shadowGitUrl);
  }

  pathname(): string {
    return this.url.pathname;
  }

  toString(): string {
    return this.url.toString();
  }
}
