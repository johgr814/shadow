import http from 'node:http';
import type { IBackend, IConfig } from '@shadow/shared';

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
    const method = req.method ?? 'GET';

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value == null) continue;
      if (Array.isArray(value)) {
        for (const v of value) {
          headers.append(key, v);
        }
      } else {
        headers.set(key, value);
      }
    }

    const body = method.toUpperCase() === 'POST' ? await readBody(req) : null;

    const request = new Request(`http://localhost${rawUrl}`, {
      method,
      headers,
      body,
    });

    const response = await this.config.engine.handle(request);

    res.statusCode = response.status;

    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    const responseBody = await response.text();
    res.end(responseBody);
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

async function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}
