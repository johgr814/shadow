import git from 'isomorphic-git';
import { Volume, createFsFromVolume } from 'memfs';
import type { IContent } from './content.js';
import type { FileName } from './fileName.js';
import { GitServerUrl } from './gitServerUrl.js';
import { ContentTypeHeader, ShadowGitUrlHeader } from './httpHeaders.js';
import type { IStorage, ISurl } from './interfaces.js';
import type { IResourceTemplate } from './resource.js';
import type { Url } from './url.js';

const DIR = '/';

class GitSurl implements ISurl {
  readonly _brand?: never;

  private constructor(
    private readonly value: string,
    readonly contentType: ContentTypeHeader | null,
    readonly shadowGitUrl: ShadowGitUrlHeader | null,
  ) {}

  static _create(
    value: string,
    contentType: ContentTypeHeader | null,
    shadowGitUrl: ShadowGitUrlHeader | null,
  ): GitSurl {
    return new GitSurl(value, contentType, shadowGitUrl);
  }

  toString(): string {
    return this.value;
  }
}

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

  surlFromRequest(request: Request): ISurl {
    const url = new URL(request.url);
    const value = url.pathname;
    if (!value || value.trim().length === 0) {
      throw new Error('GitSurl: url pathname must not be empty');
    }
    const rawContentType = request.headers.get('content-type');
    const rawShadowGitUrl = request.headers.get('x-shadow-git-url');
    return GitSurl._create(
      value,
      rawContentType ? ContentTypeHeader.of(rawContentType) : null,
      rawShadowGitUrl ? ShadowGitUrlHeader.of(rawShadowGitUrl) : null,
    );
  }

  surlFromFileName(fileName: FileName, url: Url): ISurl {
    return GitSurl._create(
      fileName.toString(),
      url.contentType,
      url.shadowGitUrl,
    );
  }

  query(_surl: ISurl): IContent {
    return { surl: _surl };
  }

  async saveResource(surl: ISurl, def: IResourceTemplate): Promise<void> {
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
