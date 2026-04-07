import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('frontend bootstrap', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.resetModules();
  });

  it('sets app title in DOM when #app-title exists', async () => {
    document.body.innerHTML = '<h1 id="app-title"></h1>';

    await import('../../src/main');

    const titleElement = document.querySelector('#app-title');
    expect(titleElement?.textContent).toBe('Shadow Configuration Server');
  });

  it('throws when #app-title element is missing', async () => {
    await expect(import('../../src/main')).rejects.toThrow(
      'Missing #app-title element in document.',
    );
  });
});
