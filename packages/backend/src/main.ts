import fs from 'node:fs';
import path from 'node:path';
import {
  Engine,
  GitStorage,
  HtmlRenderer,
  InstancesDir,
  Router,
} from '@shadow/shared';
import type { IConfig } from '@shadow/shared';
import git from 'isomorphic-git';
import { Port, ServerBackend } from './ServerBackend.js';

const instancesPath = path.resolve('instances', 'e2e');
const instancesDir = InstancesDir.of(instancesPath);

fs.mkdirSync(instancesPath, { recursive: true });

const isGitRepo = fs.existsSync(path.join(instancesPath, '.git'));
if (!isGitRepo) {
  await git.init({ fs, dir: instancesPath });
}

const storage = GitStorage.of(instancesDir);
const renderer = new HtmlRenderer();
const router = Router.of(storage);
const engine = Engine.of(storage, renderer);

const config: IConfig = { router, storage, engine, instancesDir };
const port = Port.of(3000);
const backend = ServerBackend.of(config, port);

await backend.start();
console.log('Shadow server running on http://localhost:3000');
