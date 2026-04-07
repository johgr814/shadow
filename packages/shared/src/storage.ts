import git from 'isomorphic-git';
import { createFsFromVolume, vol } from 'memfs';
import type { IContent } from './content.js';
import type { IStorage } from './interfaces.js';
import type { IResourceTemplate } from './resource.js';
import type { Surl } from './url.js';

const INSTANCES_DIR = '/instances';

const memFs = createFsFromVolume(vol);

vol.mkdirSync(INSTANCES_DIR, { recursive: true });

await git.init({ fs: memFs, dir: INSTANCES_DIR });

export class GitStorage implements IStorage {
  query(_surl: Surl): IContent {
    return { surl: _surl };
  }

  async saveResource(surl: Surl, def: IResourceTemplate): Promise<void> {
    const filename = `${surl.toString()}.mustache`;
    memFs.writeFileSync(`${INSTANCES_DIR}/${filename}`, def.body.toString(), {
      encoding: 'utf-8',
    });

    await git.add({
      fs: memFs,
      dir: INSTANCES_DIR,
      filepath: filename,
    });
    await git.commit({
      fs: memFs,
      dir: INSTANCES_DIR,
      message: `Add resource ${surl.toString()}`,
      author: { name: 'shadow', email: 'shadow@local' },
    });
  }

  listResources(): ReadonlyArray<string> {
    return (memFs.readdirSync(INSTANCES_DIR) as string[])
      .filter((f) => f.endsWith('.mustache'))
      .map((f) => f.replace(/\.mustache$/, ''));
  }
}
