import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  async onModuleInit() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD || undefined;

    this.client = new Redis({
      host,
      port,
      password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 200, 3000);
        this.logger.warn(`Redis connection attempt ${times}, retrying in ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.logger.log(`Connected to Redis at ${host}:${port}`);
    });

    this.client.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    try {
      await this.client.connect();
    } catch (error) {
      this.logger.warn(`Failed to connect to Redis: ${error.message}. Running without cache.`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed gracefully');
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Redis GET error for key ${key}: ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds: number = 300): Promise<void> {
    try {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } catch (error) {
      this.logger.error(`Redis SET error for key ${key}: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Redis DEL error for key ${key}: ${error.message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis EXISTS error for key ${key}: ${error.message}`);
      return false;
    }
  }

  async flushAll(): Promise<void> {
    try {
      await this.client.flushall();
      this.logger.log('Redis cache flushed');
    } catch (error) {
      this.logger.error(`Redis FLUSHALL error: ${error.message}`);
    }
  }

  getClient(): Redis {
    return this.client;
  }
}
