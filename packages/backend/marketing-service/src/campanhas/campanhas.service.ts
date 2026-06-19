import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { DestinatariosService } from '../destinatarios/destinatarios.service';
import { CreateCampanhaDto, UpdateCampanhaDto, CampanhaQueryDto, EnviarCampanhaDto, CampanhaMetricasDto } from './dto/create-campanha.dto';
import { WhatsappService } from '../services/whatsapp.service';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';
import { PushService } from '../services/push.service';
import { CampanhaTipo } from '@prisma/client';

@Injectable()
export class CampanhasService {
  private readonly logger = new Logger(CampanhasService.name);

  constructor(
    private prisma: PrismaService,
    private destinatariosService: DestinatariosService,
    private whatsappService: WhatsappService,
    private emailService: EmailService,
    private smsService: SmsService,
    private pushService: PushService,
  ) {}

  async create(dto: CreateCampanhaDto) {
    const campanha = await this.prisma.campanha.create({
      data: {
        companyId: dto.companyId,
        nome: dto.nome,
        tipo: dto.tipo,
        segmento: dto.segmento || [],
        mensagem: dto.mensagem,
        agendamento: dto.agendamento ? new Date(dto.agendamento) : null,
      },
    });

    this.logger.log(`Campanha criada: ${campanha.nome} (${campanha.id})`);
    return { success: true, data: campanha };
  }

  async findAll(companyId: string, query: CampanhaQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.search) {
      where.OR = [
        { nome: { contains: query.search, mode: 'insensitive' } },
        { mensagem: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.tipo) where.tipo = query.tipo;
    if (query.enviada !== undefined) where.enviada = query.enviada;

    const [data, total] = await Promise.all([
      this.prisma.campanha.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.campanha.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id },
      include: { destinatarios: true },
    });
    if (!campanha) throw new NotFoundException('Campanha não encontrada');
    return { success: true, data: campanha };
  }

  async update(id: string, dto: UpdateCampanhaDto) {
    await this.findOne(id);

    const data: any = { ...dto };
    if (dto.agendamento) data.agendamento = new Date(dto.agendamento);

    const updated = await this.prisma.campanha.update({
      where: { id },
      data,
    });

    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.campanha.delete({ where: { id } });
    return { success: true, message: 'Campanha removida com sucesso' };
  }

  async enviar(id: string, dto: EnviarCampanhaDto) {
    const campanha = await this.prisma.campanha.findUnique({
      where: { id },
      include: { destinatarios: true },
    });
    if (!campanha) throw new NotFoundException('Campanha não encontrada');
    if (campanha.enviada) throw new BadRequestException('Campanha já foi enviada');

    if (dto.agendamento) {
      const updated = await this.prisma.campanha.update({
        where: { id },
        data: { agendamento: new Date(dto.agendamento) },
      });
      return { success: true, message: 'Campanha agendada com sucesso', data: updated };
    }

    const destinatarios = campanha.destinatarios;
    if (destinatarios.length === 0) {
      throw new BadRequestException('Campanha não possui destinatários');
    }

    const sendPromises = destinatarios.map(async (dest) => {
      try {
        switch (campanha.tipo) {
          case CampanhaTipo.SMS:
            if (dest.celular) {
              await this.smsService.send(dest.celular, campanha.mensagem);
            }
            break;
          case CampanhaTipo.WHATSAPP:
            if (dest.celular) {
              await this.whatsappService.send(dest.celular, campanha.mensagem);
            }
            break;
          case CampanhaTipo.EMAIL:
            if (dest.email) {
              await this.emailService.send(dest.email, campanha.nome, campanha.mensagem);
            }
            break;
          case CampanhaTipo.PUSH_NOTIFICATION:
            break;
        }
        return this.destinatariosService.markEnviado(dest.id);
      } catch (error) {
        this.logger.error(`Falha ao enviar para ${dest.id}: ${error.message}`);
        return null;
      }
    });

    await Promise.all(sendPromises);

    const totalEnviados = destinatarios.length;
    const updated = await this.prisma.campanha.update({
      where: { id },
      data: {
        enviada: true,
        dataEnvio: new Date(),
        totalEnviados,
      },
    });

    this.logger.log(`Campanha ${campanha.nome} enviada para ${totalEnviados} destinatários`);
    return { success: true, message: 'Campanha enviada com sucesso', data: updated };
  }

  async updateMetricas(id: string, dto: CampanhaMetricasDto) {
    await this.findOne(id);
    const updated = await this.prisma.campanha.update({
      where: { id },
      data: {
        totalEnviados: dto.totalEnviados,
        totalAbertos: dto.totalAbertos,
        totalCliques: dto.totalCliques,
        conversao: dto.conversao,
      },
    });
    return { success: true, data: updated };
  }
}
