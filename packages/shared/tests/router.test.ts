import { describe, expect, it } from 'vitest';
import { Router } from '../src/router.js';
import { GitStorage } from '../src/storage.js';
import { Url } from '../src/url.js';

describe('Router', () => {
  it('resolves a url and returns content with matching surl', () => {
    const storage = new GitStorage();
    const router = Router.of(storage);
    const url = Url.of('/my-resource', null, null);
    const content = router.resolve(url);
    expect(content.surl.toString()).toBe('/my-resource');
  });
});
