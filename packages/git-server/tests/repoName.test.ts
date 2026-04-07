import { describe, expect, it } from 'vitest';
import { RepoName } from '../src/repoName.js';

describe('RepoName', () => {
  it('wraps a valid name', () => {
    const name = RepoName.of('e2e');
    expect(name.toString()).toBe('e2e');
  });

  it('accepts alphanumeric names', () => {
    const name = RepoName.of('myRepo123');
    expect(name.toString()).toBe('myRepo123');
  });

  it('accepts names with hyphens', () => {
    const name = RepoName.of('my-repo');
    expect(name.toString()).toBe('my-repo');
  });

  it('accepts names with underscores', () => {
    const name = RepoName.of('my_repo');
    expect(name.toString()).toBe('my_repo');
  });

  it('throws on empty string', () => {
    expect(() => RepoName.of('')).toThrow('RepoName must not be empty');
  });

  it('throws on whitespace-only string', () => {
    expect(() => RepoName.of('   ')).toThrow('RepoName must not be empty');
  });

  it('throws on names with spaces', () => {
    expect(() => RepoName.of('my repo')).toThrow(
      'RepoName must only contain alphanumeric characters, hyphens, or underscores',
    );
  });

  it('throws on names with special characters', () => {
    expect(() => RepoName.of('my/repo')).toThrow(
      'RepoName must only contain alphanumeric characters, hyphens, or underscores',
    );
  });
});
