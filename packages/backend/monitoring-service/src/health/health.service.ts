import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';
import { ServiceStatus } from '@prisma/client';
import { RegisterServiceDto } from './dto/health.dto';

const SERVICES = [
  { name: 'api-gateway', displayName: 'API Gateway', endpoint: 'http://localhost:3000/health' },
  { name: 'auth-service', displayName: 'Auth Service', endpoint: 'http://localhost:3001/health' },
  { name: 'pdv-service', displayName: 'PDV Service', endpoint: 'http://localhost:3004/health' },
  { name: 'inventory-service', displayName: 'Inventory Service', endpoint: 'http://localhost:3005/health' },
  { name: 'fiscal-service', displayName: 'Fiscal Service', endpoint: 'http://localhost:3006/health' },
  { name: 'financial-service', displayName: 'Financial Service', endpoint: 'http://localhost:3007/health' },
  { name: 'monitoring-service', displayName: 'Monitoring Service', endpoint: 'http://localhost:3008/health' },
  { name: 'notification-service', displayName: 'Notification Service', endpoint: 'http://localhost:3009/health' },
  { name: 'bi-service', displayName: 'BI Service', endpoint: 'http://localhost:3010/health' },
  { name: 'crm-service', displayName: 'CRM Service', endpoint: 'http://localhost:3011/health' },
  { name: 'rh-service', displayName: 'RH Service', endpoint: 'http://localhost:3012/health' },
  { name: 'security-service', displayName: 'Security Service', endpoint: 'http://localhost:3013/health' },
  { name: 'purchasing-service', displayName: 'Purchasing Service', endpoint: 'http://localhost:3014/health' },
  { name: 'distribution-service', displayName: 'Distribution Service', endpoint: 'http://localhost:3015/health' },
  { name: 'marketing-service', displayName: 'Marketing Service', endpoint: 'http://localhost:3016/health' },
  { name: 'cftv-service', displayName: 'CFTV Service', endpoint: 'http://localhost:3017/health' },
  { name: 'integration-api', displayName: 'Integration API', endpoint: 'http://localhost:3018/health' },
  { name: 'ai-service', displayName: 'AI Service', endpoint: 'http://localhost:3019/health' },
];

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedServices();
  }

  private async seedServices() {
    for (const svc of SERVICES) {
      await this.prisma.serviceHealth.upsert({
        where: { serviceName: svc.name },
        update: { endpoint: svc.endpoint },
        create: {
          serviceName: svc.name,
          endpoint: svc.endpoint,
          status: ServiceStatus.UNKNOWN,
          metadata: { displayName: svc.displayName },
        },
      });
    }
  }

  async register(dto: RegisterServiceDto) {
    return this.prisma.serviceHealth.create({
      data: {
        serviceName: dto.name,
        endpoint: dto.endpoint,
        status: ServiceStatus.UNKNOWN,
        metadata: dto.displayName ? { displayName: dto.displayName } : undefined,
      },
    });
  }

  async findAll(query: { status?: ServiceStatus }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    return this.prisma.serviceHealth.findMany({
      where,
      orderBy: { serviceName: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.serviceHealth.findUniqueOrThrow({ where: { id } });
  }

  async findByServiceName(name: string) {
    return this.prisma.serviceHealth.findUniqueOrThrow({
      where: { serviceName: name },
    });
  }

  async remove(id: string) {
    await this.prisma.serviceHealth.delete({ where: { id } });
    return { success: true, message: 'Service removed' };
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkAllServices() {
    this.logger.debug('Running health check for all services...');
    const services = await this.prisma.serviceHealth.findMany();

    for (const svc of services) {
      try {
        if (svc.serviceName === 'monitoring-service') {
          await this.prisma.serviceHealth.update({
            where: { id: svc.id },
            data: {
              status: ServiceStatus.UP,
              lastCheck: new Date(),
              uptime: process.uptime(),
              responseTime: 0,
            },
          });
          continue;
        }

        if (!svc.endpoint) {
          await this.prisma.serviceHealth.update({
            where: { id: svc.id },
            data: { status: ServiceStatus.UNKNOWN, lastCheck: new Date() },
          });
          continue;
        }

        const start = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(svc.endpoint, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const responseTime = Date.now() - start;
        const status = response.ok ? ServiceStatus.UP : ServiceStatus.DEGRADED;

        await this.prisma.serviceHealth.update({
          where: { id: svc.id },
          data: { status, lastCheck: new Date(), responseTime, uptime: 0 },
        });
      } catch (error) {
        this.logger.warn(`Service ${svc.serviceName} is down: ${error.message}`);

        await this.prisma.serviceHealth.update({
          where: { id: svc.id },
          data: {
            status: ServiceStatus.DOWN,
            lastCheck: new Date(),
            responseTime: -1,
          },
        });

        await this.createDownAlert(svc.serviceName, error.message);
      }
    }
  }

  private async createDownAlert(serviceName: string, error: string) {
    const existing = await this.prisma.alert.findFirst({
      where: {
        type: 'SERVICE_DOWN',
        message: { contains: serviceName },
        resolved: false,
      },
    });

    if (!existing) {
      await this.prisma.alert.create({
        data: {
          type: 'SERVICE_DOWN',
          severity: 'HIGH',
          message: `Service ${serviceName} is down: ${error}`,
          metadata: { serviceName, error },
        },
      });
    }
  }

  async checkService(serviceName: string) {
    const svc = await this.prisma.serviceHealth.findUnique({
      where: { serviceName },
    });
    if (!svc) throw new Error(`Service ${serviceName} not found`);

    if (!svc.endpoint) throw new Error(`No endpoint configured for ${serviceName}`);

    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(svc.endpoint, { signal: controller.signal });
      clearTimeout(timeout);

      const responseTime = Date.now() - start;
      const status = response.ok ? ServiceStatus.UP : ServiceStatus.DEGRADED;

      return this.prisma.serviceHealth.update({
        where: { id: svc.id },
        data: { status, lastCheck: new Date(), responseTime },
      });
    } catch {
      return this.prisma.serviceHealth.update({
        where: { id: svc.id },
        data: { status: ServiceStatus.DOWN, lastCheck: new Date(), responseTime: -1 },
      });
    }
  }

  async getSummary() {
    const services = await this.prisma.serviceHealth.findMany();
    const total = services.length;
    const up = services.filter((s) => s.status === ServiceStatus.UP).length;
    const down = services.filter((s) => s.status === ServiceStatus.DOWN).length;
    const degraded = services.filter((s) => s.status === ServiceStatus.DEGRADED).length;
    const unknown = services.filter((s) => s.status === ServiceStatus.UNKNOWN).length;

    return {
      total,
      up,
      down,
      degraded,
      unknown,
      uptime: (up / total) * 100,
      timestamp: new Date().toISOString(),
    };
  }
}
