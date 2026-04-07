import { Engine, GitStorage, HtmlRenderer, Router } from '@shadow/shared';
import type { IConfig } from '@shadow/shared';
import { Port, ServerBackend } from './ServerBackend.js';

const storage = new GitStorage();
const renderer = new HtmlRenderer();
const router = Router.of(storage);
const engine = Engine.of(storage, renderer);

const config: IConfig = { router, storage, engine };
const port = Port.of(3000);
const backend = ServerBackend.of(config, port);

await backend.start();
console.log('Shadow server running on http://localhost:3000');
