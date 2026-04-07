export class Url {
  private constructor(private readonly value: string) {}

  static of(value: string): Url {
    if (!value.startsWith('/')) {
      throw new Error(`Url must start with '/': ${value}`);
    }
    return new Url(value);
  }

  toString(): string {
    return this.value;
  }
}

export class Surl {
  private constructor(private readonly value: string) {}

  static of(value: string): Surl {
    if (!value || value.trim().length === 0) {
      throw new Error('Surl must not be empty');
    }
    return new Surl(value);
  }

  toString(): string {
    return this.value;
  }
}
