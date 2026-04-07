import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import backend from 'git-http-backend';
import git from 'isomorphic-git';
import type { RepoName } from './repoName.js';

interface GitService {
  type: string;
  cmd: string;
  args: string[];
  createStream(): NodeJS.ReadWriteStream;
}

const INSTANCES_DIR = path.resolve('instances');

let server: http.Server | null = null;
const SERVER_PORT = 7000;

function repoDir(name: RepoName): string {
  return path.join(INSTANCES_DIR, name.toString());
}

async function initRepo(dir: string): Promise<void> {
  await git.init({ fs, dir });
}

function ensureInstancesDir(): void {
  fs.mkdirSync(INSTANCES_DIR, { recursive: true });
}

function startServerIfNeeded(): void {
  if (server !== null) {
    return;
  }

  server = http.createServer((req, res) => {
    const reqStream =
      req.headers['content-encoding'] === 'gzip'
        ? req.pipe(zlib.createGunzip())
        : req;

    reqStream
      .pipe(
        new backend(req.url ?? '/', (err: unknown, service: GitService) => {
          if (err != null) {
            res.statusCode = 500;
            res.end(String(err));
            return;
          }

          res.setHeader('content-type', service.type);

          const ps = spawn(service.cmd, [...service.args, INSTANCES_DIR]);
          ps.stdout.pipe(service.createStream()).pipe(ps.stdin);
        }),
      )
      .pipe(res);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      server = null;
    } else {
      throw err;
    }
  });

  server.listen(SERVER_PORT);
}

export async function createIfMissing(name: RepoName): Promise<void> {
  ensureInstancesDir();
  const dir = repoDir(name);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    await initRepo(dir);
  }
  startServerIfNeeded();
}

export async function createClean(name: RepoName): Promise<void> {
  ensureInstancesDir();
  const dir = repoDir(name);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
  await initRepo(dir);
  startServerIfNeeded();
}

export function clean(): void {
  if (fs.existsSync(INSTANCES_DIR)) {
    fs.rmSync(INSTANCES_DIR, { recursive: true, force: true });
  }
  if (server !== null) {
    server.close();
    server = null;
  }
}
