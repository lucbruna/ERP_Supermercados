export interface TracingOptions {
  jaegerHost?: string;
  exportIntervalMillis?: number;
  logLevel?: number;
}

let initialized = false;

export function initTracing(serviceName: string, options: TracingOptions = {}): void {
  if (initialized) return;
  initialized = true;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Tracing] Initialized for ${serviceName}`);
  }
}

export * from './tracer';
export * from './interceptor';
