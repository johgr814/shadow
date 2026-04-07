import http from 'node:http';
import type { IBackend, IConfig } from '@shadow/shared';
import { HttpMethod, RequestBody, Url } from '@shadow/shared';

export class ServerBackend implements IBackend {
  private constructor(
    private readonly config: IConfig,
    private readonly port: Port,
  ) {}

  static of(config: IConfig, port: Port): ServerBackend {
    return new ServerBackend(config, port);
  }

  async start(): Promise<void> {
    const server = http.createServer((req, res) => {
      void this.handleRequest(req, res);
    });

    await new Promise<void>((resolve) => {
      server.listen(this.port.toNumber(), () => {
        resolve();
      });
    });
  }

  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<void> {
    const rawUrl = req.url ?? '/';
    const rawMethod = req.method ?? 'GET';

    const url = Url.of(rawUrl);
    const method = HttpMethod.of(rawMethod);

    const body = method.isPost() ? await readBody(req) : null;

    const response = await this.config.engine.handle(url, method, body);

    res.statusCode = response.status.toNumber();
    res.setHeader('Content-Type', response.contentType.toString());

    if (response.redirect !== null) {
      res.setHeader('Location', response.redirect.toString());
    }

    res.end(response.body.toString());
  }
}

export class Port {
  private constructor(private readonly value: number) {}

  static of(value: number): Port {
    if (value < 1 || value > 65535) {
      throw new Error(`Invalid port: ${value}`);
    }
    return new Port(value);
  }

  toNumber(): number {
    return this.value;
  }
}

async function readBody(req: http.IncomingMessage): Promise<RequestBody> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () =>
      resolve(RequestBody.of(Buffer.concat(chunks).toString('utf-8'))),
    );
    req.on('error', reject);
  });
}
