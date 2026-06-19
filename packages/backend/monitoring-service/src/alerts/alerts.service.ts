import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAlertDto, UpdateAlertDto, AlertQueryDto } from './dto/alerts.dto';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAlertDto) {
    const alert = await this.prisma.alert.create({
      data: {
        type: dto.type,
        severity: dto.severity || 'MEDIUM',
        message: dto.message,
        metadata: dto.metadata || undefined,
      },
    });

    this.logger.warn(`Alert created [${dto.severity || 'MEDIUM'}]: ${dto.message}`);

    return alert;
  }

  async findAll(query: AlertQueryDto) {
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.severity) where.severity = query.severity;
    if (query.resolved !== undefined) where.resolved = query.resolved;

    return this.prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const alert = await this.prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Alert not found');
    return alert;
  }

  async update(id: string, dto: UpdateAlertDto) {
    const alert = await this.prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Alert not found');

    return this.prisma.alert.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.severity !== undefined && { severity: dto.severity }),
        ...(dto.message !== undefined && { message: dto.message }),
        ...(dto.resolved !== undefined && { resolved: dto.resolved }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata }),
      },
    });
  }

  async resolve(id: string) {
    const alert = await this.prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Alert not found');

    return this.prisma.alert.update({
      where: { id },
      data: { resolved: true },
    });
  }

  async remove(id: string) {
    const alert = await this.prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Alert not found');

    await this.prisma.alert.delete({ where: { id } });
    return { success: true, message: 'Alert removed' };
  }
}
