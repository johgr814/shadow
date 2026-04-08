import type { FileName } from './fileName.js';
import type { ContentTypeHeader, ShadowGitUrlHeader } from './httpHeaders.js';
import type { Url } from './url.js';

export class Surl {
  private constructor(
    private readonly value: string,
    readonly contentType: ContentTypeHeader | null,
    readonly shadowGitUrl: ShadowGitUrlHeader | null,
  ) {}

  static fromUrl(url: Url): Surl {
    const value = url.pathname();
    if (!value || value.trim().length === 0) {
      throw new Error('Surl: url pathname must not be empty');
    }
    return new Surl(value, url.contentType, url.shadowGitUrl);
  }

  static NewResourceUrl(fileName: FileName, url: Url): Surl {
    return new Surl(fileName.toString(), url.contentType, url.shadowGitUrl);
  }

  toString(): string {
    return this.value;
  }
}
