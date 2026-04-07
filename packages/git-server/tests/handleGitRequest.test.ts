import http from 'node:http';
import { describe, expect, it } from 'vitest';
import { handleGitRequest } from '../src/gitServer.js';

function startTestServer(): Promise<{
  port: number;
  close: () => Promise<void>;
}> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      handleGitRequest(req, res);
    });
    server.listen(0, () => {
      const addr = server.address();
      if (addr == null || typeof addr === 'string') {
        reject(new Error('Unexpected server address'));
        return;
      }
      resolve({
        port: addr.port,
        close: () => new Promise<void>((res) => server.close(() => res())),
      });
    });
  });
}

function httpGet(
  port: number,
  path: string,
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    http
      .get(`http://localhost:${port}${path}`, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () =>
          resolve({
            status: res.statusCode ?? 0,
            body: Buffer.concat(chunks).toString(),
          }),
        );
      })
      .on('error', reject);
  });
}

describe('handleGitRequest', () => {
  it('returns 500 for an invalid git path', async () => {
    const { port, close } = await startTestServer();
    try {
      const { status, body } = await httpGet(port, '/invalid-path-no-service');
      expect(status).toBe(500);
      expect(body.length).toBeGreaterThan(0);
    } finally {
      await close();
    }
  });

  it('returns 400 for invalid gzip-encoded request', async () => {
    const { port, close } = await startTestServer();
    try {
      const result = await new Promise<{ status: number }>(
        (resolve, reject) => {
          const req = http.request(
            {
              hostname: 'localhost',
              port,
              path: '/some-repo/info/refs',
              method: 'GET',
              headers: { 'content-encoding': 'gzip' },
            },
            (res) => {
              res.resume();
              resolve({ status: res.statusCode ?? 0 });
            },
          );
          req.on('error', reject);
          req.end('not-gzip-data');
        },
      );
      expect(result.status).toBe(400);
    } finally {
      await close();
    }
  });
});
