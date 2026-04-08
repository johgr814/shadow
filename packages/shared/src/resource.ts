import type { IContent } from './content.js';
import type { FileName } from './fileName.js';
import type { MimeType } from './mimeType.js';
import type { Surl } from './surl.js';

export interface IResource extends IContent {
  readonly name: Surl;
}

export interface IResourceTemplate {
  readonly fileName: FileName;
  readonly mimeType: MimeType;
  readonly body: TemplateBody;
}

export class TemplateBody {
  private constructor(private readonly value: string) {}

  static of(value: string): TemplateBody {
    if (!value || value.trim().length === 0) {
      throw new Error('TemplateBody must not be empty');
    }
    return new TemplateBody(value);
  }

  toString(): string {
    return this.value;
  }
}
