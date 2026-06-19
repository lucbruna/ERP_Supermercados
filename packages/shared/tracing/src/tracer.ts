export interface Span {
  end(): void;
  setAttribute(key: string, value: unknown): void;
  setStatus(status: { code: number; message?: string }): void;
  recordException(error: Error): void;
  addEvent(name: string, attributes?: Record<string, unknown>): void;
  spanContext(): { traceId: string; spanId: string };
}

export interface SpanOptions {
  attributes?: Record<string, unknown>;
}

export function getTracer(serviceName: string) {
  return {
    startSpan(name: string, options?: SpanOptions): Span {
      return createSpan(name, options);
    },
  };
}

function createSpan(name: string, _options?: SpanOptions): Span {
  return {
    end() {},
    setAttribute(_key: string, _value: unknown) {},
    setStatus(_status: { code: number; message?: string }) {},
    recordException(_error: Error) {},
    addEvent(_name: string, _attributes?: Record<string, unknown>) {},
    spanContext() {
      return { traceId: 'stub', spanId: 'stub' };
    },
  };
}

export function startSpan(name: string, options?: SpanOptions): Span {
  return createSpan(name, options);
}

export function addEvent(span: Span, name: string, attributes?: Record<string, unknown>): void {
  span.addEvent(name, attributes);
}

export function recordException(span: Span, error: Error): void {
  span.recordException(error);
  span.setStatus({ code: 2, message: error.message });
}
