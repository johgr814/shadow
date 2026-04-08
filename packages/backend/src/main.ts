import {
  Engine,
  GitServerUrl,
  GitStorage,
  HtmlRenderer,
  Router,
} from '@shadow/shared';
import type { IConfig } from '@shadow/shared';
import { Port, ServerBackend } from './ServerBackend.js';

const renderer = new HtmlRenderer();
const gitServerUrl = GitServerUrl.of('http://localhost:7000/instances');
const storage = GitStorage.of(gitServerUrl.toString());
const router = Router.of(storage);
const engine = Engine.of(renderer);
const config: IConfig = { router, engine, gitServerUrl };
const port = Port.of(3000);
const backend = ServerBackend.of(config, port);
await backend.start();
console.log('Shadow server running on http://localhost:3000');
