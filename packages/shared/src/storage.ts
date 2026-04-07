import fs from 'node:fs';
import path from 'node:path';
import git from 'isomorphic-git';
import type { IContent } from './content.js';
import type { IStorage } from './interfaces.js';
import type { InstancesDir } from './interfaces.js';
import type { IResourceTemplate } from './resource.js';
import type { Surl } from './url.js';

export class GitStorage implements IStorage {
  private constructor(private readonly dir: string) {}

  static of(instancesDir: InstancesDir): GitStorage {
    return new GitStorage(instancesDir.toString());
  }

  query(_surl: Surl): IContent {
    const resourcesDir = path.join(this.dir, 'resources');
    if (!fs.existsSync(resourcesDir)) {
      return { surl: _surl };
    }
    return { surl: _surl };
  }

  async saveResource(surl: Surl, def: IResourceTemplate): Promise<void> {
    const resourcesDir = path.join(this.dir, 'resources');
    fs.mkdirSync(resourcesDir, { recursive: true });

    const filePath = path.join(resourcesDir, `${surl.toString()}.mustache`);
    fs.writeFileSync(filePath, def.body.toString(), 'utf-8');

    await git.add({
      fs,
      dir: this.dir,
      filepath: `resources/${surl.toString()}.mustache`,
    });
    await git.commit({
      fs,
      dir: this.dir,
      message: `Add resource ${surl.toString()}`,
      author: { name: 'shadow', email: 'shadow@local' },
    });
  }

  listResources(): ReadonlyArray<string> {
    const resourcesDir = path.join(this.dir, 'resources');
    if (!fs.existsSync(resourcesDir)) {
      return [];
    }
    return fs
      .readdirSync(resourcesDir)
      .filter((f) => f.endsWith('.mustache'))
      .map((f) => f.replace(/\.mustache$/, ''));
  }
}
