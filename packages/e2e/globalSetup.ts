import { RepoName, createClean } from '@shadow/git-server';

export default async function globalSetup(): Promise<void> {
  await createClean(RepoName.of('e2e'));
}
