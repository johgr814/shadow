import { describe, expect, it } from 'vitest';
import { Router } from '../src/router.js';
import { GitStorage } from '../src/storage.js';

describe('Router', () => {
  it('resolves a request and returns content with matching surl', () => {
    const storage = GitStorage.of('http://localhost:7000/instances');
    const router = Router.of(storage);
    const request = new Request('http://localhost:3000/my-resource');
    const content = router.resolve(request);
    expect(content.surl.toString()).toBe('/my-resource');
  });
});
