import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as os from 'os';
import { PrismaService } from '../common/prisma.service';
import { MetricQueryDto } from './dto/metrics.dto';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private prisma: PrismaService) {}

  async getCurrentMetrics() {
    const cpu = this.getCpuUsage();
    const memory = this.getMemoryUsage();
    const disk = await this.getDiskUsage();

    return { cpu, memory, disk, timestamp: new Date().toISOString() };
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async collectMetrics() {
    try {
      const cpu = this.getCpuUsage();
      const memory = this.getMemoryUsage();
      const disk = await this.getDiskUsage();

      await this.prisma.systemMetric.create({
        data: { cpu, memory, disk },
      });

      if (cpu > 90) {
        await this.createMetricAlert('HIGH_CPU', `CPU usage at ${cpu.toFixed(1)}%`, 'HIGH', { cpu });
      }
      if (memory > 90) {
        await this.createMetricAlert('HIGH_MEMORY', `Memory usage at ${memory.toFixed(1)}%`, 'HIGH', { memory });
      }
      if (disk > 90) {
        await this.createMetricAlert('HIGH_DISK', `Disk usage at ${disk.toFixed(1)}%`, 'HIGH', { disk });
      }

      this.logger.debug(`Metrics collected - CPU: ${cpu.toFixed(1)}%, Memory: ${memory.toFixed(1)}%, Disk: ${disk.toFixed(1)}%`);
    } catch (error) {
      this.logger.error(`Failed to collect metrics: ${error.message}`);
    }
  }

  private getCpuUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    return parseFloat(((1 - idle / total) * 100).toFixed(2));
  }

  private getMemoryUsage(): number {
    const total = os.totalmem();
    const free = os.freemem();
    return parseFloat(((1 - free / total) * 100).toFixed(2));
  }

  private async getDiskUsage(): Promise<number> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      if (process.platform === 'win32') {
        const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption');
        const lines = stdout.trim().split('\n').slice(1).filter(Boolean);
        let total = 0;
        let free = 0;

        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 3) {
            const size = parseFloat(parts[1]);
            const freeSpace = parseFloat(parts[2]);
            if (!isNaN(size) && !isNaN(freeSpace)) {
              total += size;
              free += freeSpace;
            }
          }
        }

        return total > 0 ? parseFloat(((1 - free / total) * 100).toFixed(2)) : 0;
      }

      const { stdout } = await execAsync('df -k / | tail -1 | awk \'{print $5}\'');
      return parseFloat(stdout.trim().replace('%', ''));
    } catch {
      return 0;
    }
  }

  private async createMetricAlert(type: 'HIGH_CPU' | 'HIGH_MEMORY' | 'HIGH_DISK', message: string, severity: string, metadata: any) {
    const existing = await this.prisma.alert.findFirst({
      where: {
        type: type as any,
        resolved: false,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
    });

    if (!existing) {
      await this.prisma.alert.create({
        data: {
          type: type as any,
          severity: severity as any,
          message,
          metadata,
        },
      });
    }
  }

  async getHistory(query: MetricQueryDto) {
    const where: any = {};
    if (query.startDate) where.timestamp = { ...where.timestamp, gte: new Date(query.startDate) };
    if (query.endDate) where.timestamp = { ...where.timestamp, lte: new Date(query.endDate) };

    return this.prisma.systemMetric.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: query.limit || 100,
    });
  }

  async getLatest() {
    return this.prisma.systemMetric.findFirst({
      orderBy: { timestamp: 'desc' },
    });
  }
}
