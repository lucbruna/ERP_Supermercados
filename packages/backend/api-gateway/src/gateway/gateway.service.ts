import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { RedisService } from '../common/redis.service';
import * as httpProxy from 'http-proxy-middleware';

export interface ServiceRoute {
  name: string;
  prefix: string;
  target: string;
  healthEndpoint: string;
}

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  private readonly services: ServiceRoute[] = [
    { name: 'Auth', prefix: 'auth', target: 'http://auth-service:3001', healthEndpoint: '/health' },
    { name: 'RH', prefix: 'rh', target: 'http://rh-service:3002', healthEndpoint: '/health' },
    { name: 'Financial', prefix: 'financial', target: 'http://financial-service:3003', healthEndpoint: '/health' },
    { name: 'PDV', prefix: 'pdv', target: 'http://pdv-service:3004', healthEndpoint: '/health' },
    { name: 'Inventory', prefix: 'inventory', target: 'http://inventory-service:3005', healthEndpoint: '/health' },
    { name: 'CRM', prefix: 'crm', target: 'http://crm-service:3006', healthEndpoint: '/health' },
    { name: 'Marketing', prefix: 'marketing', target: 'http://marketing-service:3007', healthEndpoint: '/health' },
    { name: 'Security', prefix: 'security', target: 'http://security-service:3008', healthEndpoint: '/health' },
    { name: 'Monitoring', prefix: 'monitoring', target: 'http://monitoring-service:3009', healthEndpoint: '/health' },
    { name: 'CFTV', prefix: 'cftv', target: 'http://cftv-service:3010', healthEndpoint: '/health' },
    { name: 'Distribution', prefix: 'distribution', target: 'http://distribution-service:3011', healthEndpoint: '/health' },
    { name: 'BI', prefix: 'bi', target: 'http://bi-service:3012', healthEndpoint: '/health' },
    { name: 'AI', prefix: 'ai', target: 'http://ai-service:3013', healthEndpoint: '/health' },
    { name: 'Notification', prefix: 'notification', target: 'http://notification-service:3014', healthEndpoint: '/health' },
    { name: 'Realtime', prefix: 'realtime', target: 'http://realtime-service:3021', healthEndpoint: '/health' },
  ];

  constructor(
    private readonly httpService: HttpService,
    private readonly redisService: RedisService,
  ) {}

  getServices(): ServiceRoute[] {
    return this.services;
  }

  findService(prefix: string): ServiceRoute | undefined {
    return this.services.find((s) => s.prefix === prefix);
  }

  async proxyRequest(
    servicePrefix: string,
    path: string,
    method: string,
    body: any,
    query: any,
    headers: Record<string, string>,
  ): Promise<any> {
    const service = this.findService(servicePrefix);
    if (!service) {
      throw new HttpException(
        { statusCode: HttpStatus.NOT_FOUND, message: `Service '${servicePrefix}' not found` },
        HttpStatus.NOT_FOUND,
      );
    }

    const targetUrl = `${service.target}${path.startsWith('/') ? path : '/' + path}`;
    const requestHeaders = this.sanitizeHeaders(headers);

    this.logger.log(`[${method.toUpperCase()}] ${targetUrl}`);

    try {
      const config: AxiosRequestConfig = {
        method: method as any,
        url: targetUrl,
        data: body,
        params: query,
        headers: requestHeaders,
        timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
        validateStatus: () => true,
      };

      const response = await lastValueFrom(
        this.httpService.request(config).pipe(
          map((res: AxiosResponse) => ({
            status: res.status,
            data: res.data,
            headers: res.headers,
          })),
        ),
      );

      if (response.status >= 400) {
        this.logger.warn(`[${service.name}] ${response.status} ${targetUrl}`);
      }

      return response;
    } catch (error) {
      this.logger.error(
        `[${service.name}] Proxy error: ${error.message}`,
        error.stack,
      );

      if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
        throw new HttpException(
          {
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            message: `Service '${service.name}' is currently unavailable`,
            service: service.name,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          message: 'An unexpected error occurred while proxying the request',
          service: service.name,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async checkServiceHealth(service: ServiceRoute): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get(`${service.target}${service.healthEndpoint}`, { timeout: 5000 })
          .pipe(map((res: AxiosResponse) => res.data)),
      );
      return { service: service.name, status: 'up', details: response };
    } catch (error) {
      this.logger.warn(`Health check failed for ${service.name}: ${error.message}`);
      return { service: service.name, status: 'down', error: error.message };
    }
  }

  async getCachedOrFetch(key: string, fetchFn: () => Promise<any>, ttl: number = 300): Promise<any> {
    const cached = await this.redisService.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    const data = await fetchFn();
    await this.redisService.set(key, JSON.stringify(data), ttl);
    return data;
  }

  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const forbidden = ['host', 'connection', 'content-length', 'transfer-encoding'];
    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (!forbidden.includes(key.toLowerCase())) {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}
