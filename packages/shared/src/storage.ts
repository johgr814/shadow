import git from 'isomorphic-git';
import { Volume, createFsFromVolume } from 'memfs';
import type { IContent } from './content.js';
import { GitServerUrl } from './gitServerUrl.js';
import type { IStorage } from './interfaces.js';
import type { IResourceTemplate } from './resource.js';
import type { Surl } from './surl.js';

const DIR = '/';

export class GitStorage implements IStorage {
  private readonly vol: InstanceType<typeof Volume>;
  private readonly memFs: ReturnType<typeof createFsFromVolume>;
  private readonly initPromise: Promise<void>;

  readonly remoteUrl: GitServerUrl;

  private constructor(remoteUrl: GitServerUrl) {
    this.remoteUrl = remoteUrl;
    this.vol = new Volume();
    this.memFs = createFsFromVolume(this.vol);
    this.vol.mkdirSync(DIR, { recursive: true });
    this.initPromise = git.init({ fs: this.memFs, dir: DIR });
  }

  static of(remoteUrl: string): GitStorage {
    return new GitStorage(GitServerUrl.of(remoteUrl));
  }

  query(_surl: Surl): IContent {
    return { surl: _surl };
  }

  async saveResource(surl: Surl, def: IResourceTemplate): Promise<void> {
    await this.initPromise;
    const filename = `${surl.toString()}.mustache`;
    this.memFs.writeFileSync(`${DIR}/${filename}`, def.body.toString(), {
      encoding: 'utf-8',
    });
    await git.add({
      fs: this.memFs,
      dir: DIR,
      filepath: filename,
    });
    await git.commit({
      fs: this.memFs,
      dir: DIR,
      message: `Add resource ${surl.toString()}`,
      author: { name: 'shadow', email: 'shadow@local' },
    });
  }

  listResources(): ReadonlyArray<string> {
    return (this.memFs.readdirSync(DIR) as string[])
      .filter((f) => f.endsWith('.mustache'))
      .map((f) => f.replace(/\.mustache$/, ''));
  }
}
