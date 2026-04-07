export class RepoName {
  private constructor(private readonly value: string) {}

  static of(value: string): RepoName {
    if (!value || value.trim().length === 0) {
      throw new Error('RepoName must not be empty');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new Error(
        `RepoName must only contain alphanumeric characters, hyphens, or underscores: ${value}`,
      );
    }
    return new RepoName(value.trim());
  }

  toString(): string {
    return this.value;
  }
}
