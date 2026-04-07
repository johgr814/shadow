export class ContentTypeHeader {
  private constructor(private readonly value: string) {}

  static of(value: string): ContentTypeHeader {
    if (!value || value.trim().length === 0) {
      throw new Error('Content-Type header must not be empty');
    }
    return new ContentTypeHeader(value.trim());
  }

  toString(): string {
    return this.value;
  }
}

export class ShadowGitUrlHeader {
  private constructor(private readonly value: string) {}

  static of(value: string): ShadowGitUrlHeader {
    if (!value || value.trim().length === 0) {
      throw new Error('X-Shadow-Git-URL header must not be empty');
    }
    return new ShadowGitUrlHeader(value.trim());
  }

  toString(): string {
    return this.value;
  }
}
