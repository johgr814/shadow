export class HttpStatus {
  private constructor(private readonly value: number) {}

  static of(value: number): HttpStatus {
    if (value < 100 || value > 599) {
      throw new Error(`Invalid HTTP status code: ${value}`);
    }
    return new HttpStatus(value);
  }

  static readonly OK = HttpStatus.of(200);
  static readonly SEE_OTHER = HttpStatus.of(303);
  static readonly BAD_REQUEST = HttpStatus.of(400);
  static readonly INTERNAL_SERVER_ERROR = HttpStatus.of(500);

  toNumber(): number {
    return this.value;
  }
}

export class ResponseBody {
  private constructor(private readonly value: string) {}

  static of(value: string): ResponseBody {
    return new ResponseBody(value);
  }

  static empty(): ResponseBody {
    return new ResponseBody('');
  }

  toString(): string {
    return this.value;
  }
}

export class RedirectLocation {
  private constructor(private readonly value: string) {}

  static of(value: string): RedirectLocation {
    if (!value.startsWith('/')) {
      throw new Error(`RedirectLocation must start with '/': ${value}`);
    }
    return new RedirectLocation(value);
  }

  toString(): string {
    return this.value;
  }
}

export interface IResponse {
  readonly status: HttpStatus;
  readonly body: ResponseBody;
  readonly redirect: RedirectLocation | null;
  readonly contentType: ContentType;
}

export class ContentType {
  private constructor(private readonly value: string) {}

  static of(value: string): ContentType {
    return new ContentType(value);
  }

  static readonly HTML = ContentType.of('text/html; charset=utf-8');
  static readonly JSON = ContentType.of('application/json');

  toString(): string {
    return this.value;
  }
}

export class Response implements IResponse {
  private constructor(
    readonly status: HttpStatus,
    readonly body: ResponseBody,
    readonly redirect: RedirectLocation | null,
    readonly contentType: ContentType,
  ) {}

  static ok(body: ResponseBody, contentType: ContentType): Response {
    return new Response(HttpStatus.OK, body, null, contentType);
  }

  static redirect(location: RedirectLocation): Response {
    return new Response(
      HttpStatus.SEE_OTHER,
      ResponseBody.empty(),
      location,
      ContentType.HTML,
    );
  }

  static badRequest(body: ResponseBody): Response {
    return new Response(HttpStatus.BAD_REQUEST, body, null, ContentType.HTML);
  }
}
