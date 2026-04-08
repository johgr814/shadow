import mime from 'mime-types';

export class MimeType {
  private constructor(private readonly value: string) {}

  static of(raw: string): MimeType {
    if (!raw || raw.trim().length === 0) {
      throw new Error('MimeType must not be empty');
    }
    const trimmed = raw.trim();
    const normalized = mime.contentType(trimmed);
    if (normalized === false) {
      throw new Error(`MimeType is not a valid mime type: ${trimmed}`);
    }
    const base = normalized.split(';')[0];
    if (base === undefined) {
      throw new Error(`MimeType is not a valid mime type: ${trimmed}`);
    }
    return new MimeType(base.trim());
  }

  toString(): string {
    return this.value;
  }
}
