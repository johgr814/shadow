export class FileName {
  private constructor(private readonly value: string) {}

  static of(value: string): FileName {
    if (!value || value.trim().length === 0) {
      throw new Error('FileName must not be empty');
    }
    return new FileName(value.trim());
  }

  toString(): string {
    return this.value;
  }
}
