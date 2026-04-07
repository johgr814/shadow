export class RenderedHtml {
  private constructor(private readonly value: string) {}

  static of(value: string): RenderedHtml {
    return new RenderedHtml(value);
  }

  toString(): string {
    return this.value;
  }
}
