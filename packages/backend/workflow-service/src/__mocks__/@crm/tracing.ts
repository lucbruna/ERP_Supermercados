export function initTracing(serviceName: string, options?: any): void {
  // no-op
}

export class TracingInterceptor {
  intercept(context: any, next: { handle: () => any }) {
    return next.handle();
  }
}

export const trace = {
  getSpan: jest.fn(),
  setSpan: jest.fn(),
  getTracer: jest.fn(() => ({
    startSpan: jest.fn(() => ({
      setAttribute: jest.fn(),
      addEvent: jest.fn(),
      end: jest.fn(),
      setStatus: jest.fn(),
      recordException: jest.fn(),
    })),
  })),
};

export const context = {
  active: jest.fn(),
  with: jest.fn(),
  set: jest.fn(),
};