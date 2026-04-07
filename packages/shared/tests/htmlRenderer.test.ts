import { describe, expect, it } from 'vitest';
import { HtmlRenderer } from '../src/htmlRenderer.js';

describe('HtmlRenderer', () => {
  const renderer = new HtmlRenderer();

  describe('renderIndex', () => {
    it('renders heading and no-resources message when list is empty', () => {
      const html = renderer.renderIndex({ resources: [] }).toString();
      expect(html).toContain('<h1>Shadow</h1>');
      expect(html).toContain('No resources yet');
      expect(html).toContain('Create new resource');
    });

    it('renders resource list when resources exist', () => {
      const html = renderer
        .renderIndex({
          resources: ['my-template', 'other'],
        })
        .toString();
      expect(html).toContain('my-template');
      expect(html).toContain('other');
      expect(html).toContain('<ul>');
    });

    it('still shows create link when resources exist', () => {
      const html = renderer.renderIndex({ resources: ['x'] }).toString();
      expect(html).toContain('Create new resource');
    });
  });

  describe('renderNewResource', () => {
    it('renders form with name and body fields', () => {
      const html = renderer.renderNewResource({ errors: [] }).toString();
      expect(html).toContain('<h1>New Resource</h1>');
      expect(html).toContain('Resource name');
      expect(html).toContain('Template');
      expect(html).toContain('<button type="submit">Save</button>');
    });

    it('renders errors when provided', () => {
      const html = renderer
        .renderNewResource({
          errors: ['Name is required', 'Body is required'],
        })
        .toString();
      expect(html).toContain('Name is required');
      expect(html).toContain('Body is required');
    });

    it('renders no error block when errors list is empty', () => {
      const html = renderer.renderNewResource({ errors: [] }).toString();
      expect(html).not.toContain('Name is required');
    });
  });
});
