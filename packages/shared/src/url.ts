import type { ContentTypeHeader, ShadowGitUrlHeader } from './httpHeaders.js';

export class Url {
  private constructor(
    private readonly value: string,
    readonly contentType: ContentTypeHeader | null,
    readonly shadowGitUrl: ShadowGitUrlHeader | null,
  ) {}

  static of(
    value: string,
    contentType: ContentTypeHeader | null,
    shadowGitUrl: ShadowGitUrlHeader | null,
  ): Url {
    if (!value.startsWith('/')) {
      throw new Error(`Url must start with '/': ${value}`);
    }
    return new Url(value, contentType, shadowGitUrl);
  }

  toString(): string {
    return this.value;
  }
}

export class Surl {
  private constructor(
    private readonly value: string,
    readonly contentType: ContentTypeHeader | null,
    readonly shadowGitUrl: ShadowGitUrlHeader | null,
  ) {}

  static of(
    value: string,
    contentType: ContentTypeHeader | null,
    shadowGitUrl: ShadowGitUrlHeader | null,
  ): Surl {
    if (!value || value.trim().length === 0) {
      throw new Error('Surl must not be empty');
    }
    return new Surl(value, contentType, shadowGitUrl);
  }

  toString(): string {
    return this.value;
  }
}
