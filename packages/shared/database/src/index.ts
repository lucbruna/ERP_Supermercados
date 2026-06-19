import { PrismaClient, Prisma } from '@prisma/client';

export interface DatabaseConfig {
  primaryUrl: string;
  replicaUrl?: string;
  poolMin?: number;
  poolMax?: number;
  slowQueryThresholdMs?: number;
  serviceName?: string;
  enableQueryLogging?: boolean;
}

export class DatabaseManager {
  private primary: PrismaClient;
  private replica: PrismaClient | null = null;
  private replicaAvailable = false;
  private config: Required<DatabaseConfig>;
  private queryCount = 0;
  private totalQueryTime = 0;

  constructor(config: DatabaseConfig) {
    this.config = {
      primaryUrl: config.primaryUrl,
      replicaUrl: config.replicaUrl || '',
      poolMin: config.poolMin ?? 5,
      poolMax: config.poolMax ?? 25,
      slowQueryThresholdMs: config.slowQueryThresholdMs ?? 100,
      serviceName: config.serviceName || 'unknown',
      enableQueryLogging: config.enableQueryLogging ?? process.env.NODE_ENV !== 'production',
    };

    this.primary = this.createClient(this.config.primaryUrl, true);

    if (this.config.replicaUrl) {
      try {
        this.replica = this.createClient(this.config.replicaUrl, false);
        this.replicaAvailable = true;
      } catch {
        console.warn('[DatabaseManager] Replica unavailable, falling back to primary for reads');
        this.replicaAvailable = false;
        this.replica = null;
      }
    }
  }

  private createClient(url: string, isPrimary: boolean): PrismaClient {
    const poolConfig = isPrimary
      ? `&pool_timeout=${30}&connection_limit=${this.config.poolMax}`
      : `&pool_timeout=${30}&connection_limit=${this.config.poolMax}`;

    const datasourceUrl = url.includes('?')
      ? `${url}&pgbouncer=true${poolConfig}`
      : `${url}?pgbouncer=true${poolConfig}`;

    const logOptions: Prisma.LogDefinition[] = [];

    if (this.config.enableQueryLogging) {
      logOptions.push({ emit: 'event', level: 'query' });
    }

    if (process.env.NODE_ENV !== 'production') {
      logOptions.push({ emit: 'stdout', level: 'warn' });
      logOptions.push({ emit: 'stdout', level: 'error' });
    }

    const client = new PrismaClient({
      datasourceUrl,
      log: logOptions,
    });

    if (this.config.enableQueryLogging) {
      client.$on('query' as any, (e: any) => {
        this.queryCount++;
        this.totalQueryTime += e.duration;

        if (e.duration > this.config.slowQueryThresholdMs) {
          console.warn(
            `[${this.config.serviceName}] SLOW QUERY (${e.duration.toFixed(2)}ms): ${e.query.substring(0, 200)}`,
          );
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `[${this.config.serviceName}] Query (${e.duration.toFixed(2)}ms): ${e.query.substring(0, 100)}`,
          );
        }
      });
    }

    return client;
  }

  getPrimary(): PrismaClient {
    return this.primary;
  }

  getReplica(): PrismaClient {
    if (this.replicaAvailable && this.replica) {
      return this.replica;
    }
    return this.primary;
  }

  async query<T>(
    action: (client: PrismaClient) => Promise<T>,
    useReplica = true,
  ): Promise<T> {
    const client = useReplica ? this.getReplica() : this.getPrimary();
    return action(client);
  }

  async transaction<T>(
    action: (client: PrismaClient) => Promise<T>,
  ): Promise<T> {
    return this.primary.$transaction(async (tx) => action(tx as unknown as PrismaClient));
  }

  resetQueryMetrics(): { count: number; totalTimeMs: number } {
    const metrics = {
      count: this.queryCount,
      totalTimeMs: this.totalQueryTime,
    };
    this.queryCount = 0;
    this.totalQueryTime = 0;
    return metrics;
  }

  async healthCheck(): Promise<{
    primary: boolean;
    replica: boolean;
    queryCount: number;
  }> {
    const results = {
      primary: false,
      replica: false,
      queryCount: this.queryCount,
    };

    try {
      await this.primary.$queryRaw`SELECT 1`;
      results.primary = true;
    } catch {
      results.primary = false;
    }

    if (this.replica && this.replicaAvailable) {
      try {
        await this.replica.$queryRaw`SELECT 1`;
        results.replica = true;
      } catch {
        results.replica = false;
        this.replicaAvailable = false;
      }
    }

    return results;
  }

  async disconnect(): Promise<void> {
    await Promise.all([
      this.primary.$disconnect(),
      ...(this.replica ? [this.replica.$disconnect()] : []),
    ]);
  }
}

export function createDatabaseManager(config: DatabaseConfig): DatabaseManager {
  return new DatabaseManager(config);
}

export { PrismaClient };
