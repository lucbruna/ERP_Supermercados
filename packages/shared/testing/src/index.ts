import { jest } from '@jest/globals';

export interface MockPrismaClient {
  create: jest.Mock;
  findMany: jest.Mock;
  findUnique: jest.Mock;
  findFirst: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  upsert: jest.Mock;
  count: jest.Mock;
  aggregate: jest.Mock;
  groupBy: jest.Mock;
  [key: string]: any;
}

export function createMockRepository(): MockPrismaClient {
  return {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  };
}

export function createMockPrismaService() {
  const models = [
    'user', 'empresa', 'unidade', 'permission', 'role', 'auditLog',
    'session', 'mfa', 'produto', 'categoria', 'fornecedor', 'cliente',
    'pedido', 'itemPedido', 'estoque', 'movimentoEstoque', 'nfce',
    'nfe', 'cfop', 'tributo', 'convenio', 'crediario', 'contrato',
    'frota', 'veiculo', 'rota', 'entrega', 'notificacao', 'arquivo',
    'habilidade', 'colaborador', 'treinamento', 'cftv', 'camera',
    'gravacao', 'biReport', 'biQuery', 'biDashboard', 'workflow',
    'workflowStep', 'workflowExecution', 'integrationLog',
    'codigoBarras', 'produtoCodigoBarras',
  ];

  const mock: Record<string, MockPrismaClient> = {};
  for (const model of models) {
    mock[model] = createMockRepository();
  }

  mock.$connect = jest.fn();
  mock.$disconnect = jest.fn();
  mock.$on = jest.fn();
  mock.$use = jest.fn();
  mock.$transaction = jest.fn((fn: any) => fn(mock));
  mock.$queryRaw = jest.fn();
  mock.$executeRaw = jest.fn();

  return mock as any;
}

export interface MockRequest {
  headers: Record<string, string>;
  user?: any;
  body?: any;
  query?: Record<string, string>;
  params?: Record<string, string>;
  ip?: string;
  method?: string;
  path?: string;
  url?: string;
  [key: string]: any;
}

export function mockRequest(overrides: Partial<MockRequest> = {}): MockRequest {
  return {
    headers: {},
    body: {},
    query: {},
    params: {},
    ip: '127.0.0.1',
    method: 'GET',
    path: '/',
    url: '/',
    ...overrides,
  };
}

export interface MockResponse {
  status: jest.Mock;
  json: jest.Mock;
  send: jest.Mock;
  end: jest.Mock;
  set: jest.Mock;
  get: jest.Mock;
  cookie: jest.Mock;
  clearCookie: jest.Mock;
  redirect: jest.Mock;
  render: jest.Mock;
  type: jest.Mock;
  [key: string]: any;
}

export function mockResponse(): MockResponse {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.send = jest.fn(() => res);
  res.end = jest.fn(() => res);
  res.set = jest.fn(() => res);
  res.get = jest.fn();
  res.cookie = jest.fn(() => res);
  res.clearCookie = jest.fn(() => res);
  res.redirect = jest.fn(() => res);
  res.render = jest.fn(() => res);
  res.type = jest.fn(() => res);
  return res;
}

export async function waitFor(
  fn: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await fn()) return;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error(`waitFor timed out after ${timeout}ms`);
}
