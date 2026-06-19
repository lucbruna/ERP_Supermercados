import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

@Injectable()
export class RedisAdapterService extends IoAdapter implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisAdapterService.name);
  private pubClient: Redis;
  private subClient: Redis;
  private redisAvailable = false;

  async onModuleInit() {
    if (process.env.REDIS_URL || process.env.REDIS_HOST) {
      try {
        const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;
        this.pubClient = new Redis(redisUrl);
        this.subClient = new Redis(redisUrl);
        this.pubClient.on('error', (err) => this.logger.warn('Redis pub client error:', err.message));
        this.subClient.on('error', (err) => this.logger.warn('Redis sub client error:', err.message));
        this.redisAvailable = true;
        this.logger.log('Redis adapter configured for Socket.IO');
      } catch (error) {
        this.logger.warn('Redis unavailable, falling back to in-memory adapter');
        this.redisAvailable = false;
      }
    } else {
      this.logger.log('No Redis config found, using in-memory Socket.IO adapter');
      this.redisAvailable = false;
    }
  }

  async onModuleDestroy() {
    if (this.pubClient) await this.pubClient.quit();
    if (this.subClient) await this.subClient.quit();
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options);
    if (this.redisAvailable) {
      server.adapter(createAdapter(this.pubClient, this.subClient));
      this.logger.log('Socket.IO Redis adapter attached');
    }
    return server;
  }
}
