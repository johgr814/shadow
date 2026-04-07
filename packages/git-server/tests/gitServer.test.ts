import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { clean, createClean, createIfMissing } from '../src/gitServer.js';
import { RepoName } from '../src/repoName.js';

const INSTANCES_DIR = path.resolve('instances');

afterEach(() => {
  clean();
});

describe('createIfMissing', () => {
  it('creates the repo directory if it does not exist', async () => {
    const name = RepoName.of('test-repo');
    await createIfMissing(name);
    expect(fs.existsSync(path.join(INSTANCES_DIR, 'test-repo'))).toBe(true);
  });

  it('initializes a git repo in the directory', async () => {
    const name = RepoName.of('test-repo');
    await createIfMissing(name);
    expect(fs.existsSync(path.join(INSTANCES_DIR, 'test-repo', '.git'))).toBe(
      true,
    );
  });

  it('does not recreate repo if it already exists', async () => {
    const name = RepoName.of('existing-repo');
    await createIfMissing(name);
    const sentinelPath = path.join(
      INSTANCES_DIR,
      'existing-repo',
      'sentinel.txt',
    );
    fs.writeFileSync(sentinelPath, 'keep me');
    await createIfMissing(name);
    expect(fs.existsSync(sentinelPath)).toBe(true);
  });

  it('does not throw when called twice (server already started)', async () => {
    const name = RepoName.of('double-start');
    await createIfMissing(name);
    await expect(createIfMissing(name)).resolves.toBeUndefined();
  });
});

describe('createClean', () => {
  it('creates the repo directory', async () => {
    const name = RepoName.of('clean-repo');
    await createClean(name);
    expect(fs.existsSync(path.join(INSTANCES_DIR, 'clean-repo'))).toBe(true);
  });

  it('initializes a git repo', async () => {
    const name = RepoName.of('clean-repo');
    await createClean(name);
    expect(fs.existsSync(path.join(INSTANCES_DIR, 'clean-repo', '.git'))).toBe(
      true,
    );
  });

  it('wipes existing repo content before recreating', async () => {
    const name = RepoName.of('wipe-repo');
    await createClean(name);
    const sentinelPath = path.join(INSTANCES_DIR, 'wipe-repo', 'sentinel.txt');
    fs.writeFileSync(sentinelPath, 'delete me');
    await createClean(name);
    expect(fs.existsSync(sentinelPath)).toBe(false);
  });
});

describe('clean', () => {
  it('removes the entire instances directory', async () => {
    const name = RepoName.of('to-clean');
    await createIfMissing(name);
    clean();
    expect(fs.existsSync(INSTANCES_DIR)).toBe(false);
  });

  it('is safe to call when instances directory does not exist', () => {
    expect(() => clean()).not.toThrow();
  });
});

describe('HTTP server', () => {
  it('responds to a git info/refs request', async () => {
    const name = RepoName.of('http-repo');
    await createClean(name);

    // Wait for server to be ready
    await new Promise<void>((resolve) => setTimeout(resolve, 50));

    const statusCode = await new Promise<number>((resolve, reject) => {
      http
        .get(
          'http://localhost:7000/http-repo/info/refs?service=git-upload-pack',
          (res) => {
            res.resume();
            resolve(res.statusCode ?? 0);
          },
        )
        .on('error', reject);
    });

    expect(statusCode).toBeGreaterThanOrEqual(200);
    expect(statusCode).toBeLessThan(600);
  });
});
