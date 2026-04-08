export class GitServerUrl {
  private constructor(private readonly value: string) {}

  static of(value: string): GitServerUrl {
    if (!value || value.trim().length === 0) {
      throw new Error('GitServerUrl must not be empty');
    }
    return new GitServerUrl(value.trim());
  }

  toString(): string {
    return this.value;
  }
}
