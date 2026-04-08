import { describe, expect, it } from 'vitest';
import { Router } from '../src/router.js';
import { Url } from '../src/url.js';

describe('Router', () => {
  it('resolves a url and returns content with matching surl', () => {
    const router = Router.of();
    const url = Url.of('http://localhost:3000', '/my-resource', null, null);
    const content = router.resolve(url);
    expect(content.surl.toString()).toBe('/my-resource');
  });
});
