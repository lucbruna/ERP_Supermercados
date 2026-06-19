import Transport from 'winston-transport';
import { LogEntry } from 'winston';

interface ElasticsearchTransportOptions {
  indexPrefix?: string;
  node?: string;
  level?: string;
  bufferSize?: number;
  flushInterval?: number;
  circuitBreakerDuration?: number;
}

interface ElasticsearchLogBody {
  index: string;
  body: Record<string, unknown>;
}

export class ElasticsearchTransport extends Transport {
  private node: string;
  private indexPrefix: string;
  private buffer: ElasticsearchLogBody[] = [];
  private bufferSize: number;
  private flushInterval: number;
  private circuitBreakerDuration: number;
  private circuitOpen = false;
  private circuitTimer: ReturnType<typeof setTimeout> | null = null;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private pendingFlush = false;

  constructor(opts: ElasticsearchTransportOptions = {}) {
    super({ level: opts.level });
    this.node = opts.node || process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
    this.indexPrefix = opts.indexPrefix || 'crm-logs';
    this.bufferSize = opts.bufferSize || 100;
    this.flushInterval = opts.flushInterval || 5000;
    this.circuitBreakerDuration = opts.circuitBreakerDuration || 30000;

    this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
  }

  log(info: LogEntry, callback: () => void): void {
    if (this.circuitOpen) {
      callback();
      return;
    }

    const date = new Date();
    const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    const service = (info.serviceName as string) || 'unknown';

    const body: Record<string, unknown> = {
      '@timestamp': date.toISOString(),
      level: info.level,
      message: info.message,
      service,
      environment: process.env.NODE_ENV || 'development',
      hostname: info.hostname || '',
      requestId: (info as any).requestId || '',
      correlationId: (info as any).correlationId || '',
      ...(info.metadata ? { metadata: info.metadata } : {}),
      ...(info.stack ? { stack: info.stack } : {}),
    };

    if (info.meta && typeof info.meta === 'object') {
      Object.assign(body, info.meta);
    }

    this.buffer.push({
      index: `${this.indexPrefix}-${service}-${dateStr}`,
      body,
    });

    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }

    callback();
  }

  private async flush(): Promise<void> {
    if (this.pendingFlush || this.buffer.length === 0 || this.circuitOpen) return;

    this.pendingFlush = true;
    const batch = this.buffer.splice(0, this.bufferSize);

    try {
      const body = batch.flatMap((entry) => [
        JSON.stringify({ index: { _index: entry.index } }),
        JSON.stringify(entry.body),
      ]);

      const response = await fetch(`${this.node}/_bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body.join('\n') + '\n',
      });

      if (!response.ok) {
        throw new Error(`ES bulk response: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      this.buffer.unshift(...batch);
      this.openCircuit();
    } finally {
      this.pendingFlush = false;
    }
  }

  private openCircuit(): void {
    this.circuitOpen = true;
    if (this.circuitTimer) clearTimeout(this.circuitTimer);
    this.circuitTimer = setTimeout(() => {
      this.circuitOpen = false;
      this.circuitTimer = null;
    }, this.circuitBreakerDuration);
  }

  close(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    if (this.circuitTimer) clearTimeout(this.circuitTimer);
    this.flush();
  }
}
