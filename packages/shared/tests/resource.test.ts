import { describe, expect, it } from 'vitest';
import { TemplateBody } from '../src/resource.js';

describe('TemplateBody', () => {
  it('wraps a valid template string', () => {
    const body = TemplateBody.of('Hello {{name}}!');
    expect(body.toString()).toBe('Hello {{name}}!');
  });

  it('throws on empty string', () => {
    expect(() => TemplateBody.of('')).toThrow('TemplateBody must not be empty');
  });

  it('throws on whitespace-only string', () => {
    expect(() => TemplateBody.of('   ')).toThrow(
      'TemplateBody must not be empty',
    );
  });
});
