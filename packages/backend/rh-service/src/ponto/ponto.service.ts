import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateRegistroPontoDto, UpdateRegistroPontoDto, PontoQueryDto, PontoRelatorioDto, PontoBiometricoDto } from './dto/create-ponto.dto';

@Injectable()
export class PontoService {
  private readonly logger = new Logger(PontoService.name);
  private readonly DISTANCIA_MAXIMA_METROS = 500;
  private readonly TOLERANCIA_MINUTOS = 10;

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRegistroPontoDto) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: dto.funcionarioId },
    });
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');
    if (funcionario.status !== 'ATIVO') {
      throw new BadRequestException('Funcionário não está ativo para registrar ponto');
    }

    await this.verificarTolerancia(dto.funcionarioId, dto.tipo);
    if (dto.latitude && dto.longitude) {
      await this.verificarGeolocalizacao(dto.funcionarioId, dto.latitude, dto.longitude);
    }

    const registro = await this.prisma.registroPonto.create({
      data: {
        funcionarioId: dto.funcionarioId,
        tipo: dto.tipo,
        dataHora: new Date(dto.dataHora),
        latitude: dto.latitude,
        longitude: dto.longitude,
        fotoUrl: dto.fotoUrl,
        biometriaHash: dto.biometriaHash,
        faceMatch: dto.faceMatch,
        digitalMatch: dto.digitalMatch,
        origem: dto.origem,
        ip: dto.ip,
        dispositivoId: dto.dispositivoId,
        validado: dto.origem === 'FACE_ID' || dto.origem === 'BIOMETRIA' || dto.origem === 'RELOGIO' ? true : false,
      },
    });

    await this.prisma.biometria.updateMany({
      where: { funcionarioId: dto.funcionarioId, status: 'ATIVO' },
      data: { ultimoUso: new Date() },
    });

    return { success: true, data: registro };
  }

  async registrarComBiometria(dto: PontoBiometricoDto) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: dto.funcionarioId },
    });
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');
    if (funcionario.status !== 'ATIVO') {
      throw new BadRequestException('Funcionário não está ativo');
    }

    await this.verificarTolerancia(dto.funcionarioId, dto.tipo);
    if (dto.latitude && dto.longitude) {
      await this.verificarGeolocalizacao(dto.funcionarioId, dto.latitude, dto.longitude);
    }

    const validacoes: string[] = [];
    if (dto.biometriaTipo === 'DUPLO' || dto.biometriaTipo === 'DIGITAL') {
      const digitalTemplate = await this.prisma.biometria.findFirst({
        where: { funcionarioId: dto.funcionarioId, tipo: 'DIGITAL', status: 'ATIVO' },
      });
      if (!digitalTemplate) throw new BadRequestException('Digital não cadastrada. Registre primeiro.');
      validacoes.push('DIGITAL');
    }

    if (dto.biometriaTipo === 'DUPLO' || dto.biometriaTipo === 'FACE') {
      const faceTemplate = await this.prisma.biometria.findFirst({
        where: { funcionarioId: dto.funcionarioId, tipo: 'FACE', status: 'ATIVO' },
      });
      if (!faceTemplate) throw new BadRequestException('Face não cadastrada. Registre primeiro.');
      validacoes.push('FACE');
    }

    if (validacoes.length === 0) {
      throw new BadRequestException('Selecione ao menos um método biométrico');
    }

    const registro = await this.prisma.registroPonto.create({
      data: {
        funcionarioId: dto.funcionarioId,
        tipo: dto.tipo,
        dataHora: new Date(dto.dataHora),
        latitude: dto.latitude,
        longitude: dto.longitude,
        fotoUrl: dto.fotoUrl,
        biometriaHash: dto.templateHash,
        faceMatch: validacoes.includes('FACE'),
        digitalMatch: validacoes.includes('DIGITAL'),
        origem: dto.biometriaTipo === 'DUPLO' ? 'BIOMETRIA' : dto.biometriaTipo === 'FACE' ? 'FACE_ID' : 'BIOMETRIA',
        ip: dto.ip,
        dispositivoId: dto.dispositivoId,
        validado: true,
        metodoBiometrico: dto.biometriaTipo,
      },
    });

    await this.prisma.biometria.updateMany({
      where: { funcionarioId: dto.funcionarioId, status: 'ATIVO' },
      data: { ultimoUso: new Date() },
    });

    this.logger.log(`Ponto biométrico: func=${dto.funcionarioId}, tipo=${dto.tipo}, metodos=${validacoes.join('+')}`);
    return { success: true, data: registro, metodosUtilizados: validacoes };
  }

  async findAll(query: PontoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.funcionarioId) where.funcionarioId = query.funcionarioId;
    if (query.tipo) where.tipo = query.tipo;
    if (query.origem) where.origem = query.origem;
    if (query.dataInicio || query.dataFim) {
      where.dataHora = {};
      if (query.dataInicio) where.dataHora.gte = new Date(query.dataInicio);
      if (query.dataFim) where.dataHora.lte = new Date(query.dataFim);
    }

    const [data, total] = await Promise.all([
      this.prisma.registroPonto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataHora: 'desc' },
        include: { funcionario: { select: { id: true, nome: true, matricula: true } } },
      }),
      this.prisma.registroPonto.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const registro = await this.prisma.registroPonto.findUnique({
      where: { id },
      include: { funcionario: { select: { id: true, nome: true, matricula: true } } },
    });
    if (!registro) throw new NotFoundException('Registro de ponto não encontrado');
    return { success: true, data: registro };
  }

  async update(id: string, dto: UpdateRegistroPontoDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.dataHora) data.dataHora = new Date(dto.dataHora);

    const updated = await this.prisma.registroPonto.update({
      where: { id },
      data,
    });

    return { success: true, data: updated };
  }

  async validar(id: string) {
    await this.findOne(id);
    const updated = await this.prisma.registroPonto.update({
      where: { id },
      data: { validado: true },
    });
    return { success: true, data: updated };
  }

  async generateRelatorio(dto: PontoRelatorioDto) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: dto.funcionarioId },
    });
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');

    const startDate = new Date(dto.ano, dto.mes - 1, 1);
    const endDate = new Date(dto.ano, dto.mes, 0, 23, 59, 59);

    const registros = await this.prisma.registroPonto.findMany({
      where: {
        funcionarioId: dto.funcionarioId,
        dataHora: { gte: startDate, lte: endDate },
      },
      orderBy: { dataHora: 'asc' },
    });

    const dias = new Map<string, any[]>();
    for (const r of registros) {
      const key = r.dataHora.toISOString().slice(0, 10);
      if (!dias.has(key)) dias.set(key, []);
      dias.get(key)!.push(r);
    }

    let totalHoras = 0;
    let totalHorasExtras = 0;
    let totalAtrasos = 0;
    let totalFaltas = 0;
    const diasTrabalhados = dias.size;

    for (const [_, pontos] of dias) {
      const entrada = pontos.find((p) => p.tipo === 'ENTRADA');
      const saida = pontos.find((p) => p.tipo === 'SAIDA');
      if (entrada && saida) {
        const diff = (saida.dataHora.getTime() - entrada.dataHora.getTime()) / 3600000;
        totalHoras += diff;
        if (diff > 8) totalHorasExtras += diff - 8;
        if (diff < 8) totalAtrasos += 8 - diff;
      } else {
        totalFaltas++;
      }
    }

    const espelho = await this.prisma.espelhoPonto.upsert({
      where: {
        funcionarioId_mes_ano: {
          funcionarioId: dto.funcionarioId,
          mes: dto.mes,
          ano: dto.ano,
        },
      },
      update: {
        totalHoras: Math.round(totalHoras * 100) / 100,
        totalHorasExtras: Math.round(totalHorasExtras * 100) / 100,
        totalAtrasos: Math.round(totalAtrasos * 100) / 100,
        totalFaltas,
        diasTrabalhados,
        dataFechamento: new Date(),
      },
      create: {
        funcionarioId: dto.funcionarioId,
        mes: dto.mes,
        ano: dto.ano,
        totalHoras: Math.round(totalHoras * 100) / 100,
        totalHorasExtras: Math.round(totalHorasExtras * 100) / 100,
        totalAtrasos: Math.round(totalAtrasos * 100) / 100,
        totalFaltas,
        diasTrabalhados,
        dataFechamento: new Date(),
      },
    });

    return {
      success: true,
      data: {
        espelho,
        registros,
        resumo: {
          totalHoras: Math.round(totalHoras * 100) / 100,
          totalHorasExtras: Math.round(totalHorasExtras * 100) / 100,
          totalAtrasos: Math.round(totalAtrasos * 100) / 100,
          totalFaltas,
          diasTrabalhados,
        },
      },
    };
  }

  async findCurrent(funcionarioId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ultimo = await this.prisma.registroPonto.findFirst({
      where: { funcionarioId, dataHora: { gte: today } },
      orderBy: { dataHora: 'desc' },
    });
    return { success: true, data: ultimo, isClockedIn: ultimo?.tipo === 'ENTRADA' || ultimo?.tipo === 'INTERVALO_FIM' };
  }

  async findToday(funcionarioId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const registros = await this.prisma.registroPonto.findMany({
      where: { funcionarioId, dataHora: { gte: today } },
      orderBy: { dataHora: 'asc' },
    });
    const totalHoras = this.calcularHorasTrabalhadas(registros);
    return { success: true, data: { registros, totalHoras } };
  }

  async dashboard(funcionarioId: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const mesInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const [registrosHoje, registrosMes, espelho, biometrias] = await Promise.all([
      this.prisma.registroPonto.findMany({ where: { funcionarioId, dataHora: { gte: hoje } }, orderBy: { dataHora: 'asc' } }),
      this.prisma.registroPonto.findMany({ where: { funcionarioId, dataHora: { gte: mesInicio } }, orderBy: { dataHora: 'asc' } }),
      this.prisma.espelhoPonto.findFirst({ where: { funcionarioId, mes: hoje.getMonth() + 1, ano: hoje.getFullYear() } }),
      this.prisma.biometria.findMany({ where: { funcionarioId } }),
    ]);

    return {
      success: true,
      data: {
        hoje: {
          registros: registrosHoje,
          horasTrabalhadas: this.calcularHorasTrabalhadas(registrosHoje),
          isClockedIn: registrosHoje.length > 0 && ['ENTRADA', 'INTERVALO_FIM'].includes(registrosHoje[registrosHoje.length - 1]?.tipo),
        },
        mes: { registros: registrosMes, totalHoras: this.calcularHorasTrabalhadas(registrosMes) },
        espelho,
        biometrias: biometrias.map(b => ({ tipo: b.tipo, status: b.status, qualidade: b.qualidade })),
      },
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.registroPonto.delete({ where: { id } });
    return { success: true, message: 'Registro de ponto removido' };
  }

  private async verificarTolerancia(funcionarioId: string, tipo: string) {
    if (tipo === 'ENTRADA') {
      const ultimoRegistro = await this.prisma.registroPonto.findFirst({
        where: { funcionarioId },
        orderBy: { dataHora: 'desc' },
      });
      if (ultimoRegistro && ultimoRegistro.tipo !== 'SAIDA' && ultimoRegistro.tipo !== 'INTERVALO_FIM') {
        const diffMinutos = (Date.now() - ultimoRegistro.dataHora.getTime()) / 60000;
        if (diffMinutos < this.TOLERANCIA_MINUTOS) {
          throw new BadRequestException(
            `Aguardar ${Math.ceil(this.TOLERANCIA_MINUTOS - diffMinutos)} min para novo registro`,
          );
        }
      }
    }
  }

  private async verificarGeolocalizacao(funcionarioId: string, latitude: number, longitude: number) {
    const funcionario = await this.prisma.funcionario.findUnique({ where: { id: funcionarioId } });
    if (!funcionario?.unidadeId) return;
    const ultimosRegistros = await this.prisma.registroPonto.findMany({
      where: { funcionarioId, latitude: { not: null }, longitude: { not: null } },
      orderBy: { dataHora: 'desc' },
      take: 5,
    });
    if (ultimosRegistros.length > 0) {
      const registrosValidos = ultimosRegistros.filter(r => r.latitude && r.longitude);
      if (registrosValidos.length >= 3) {
        const latMedia = registrosValidos.reduce((s, r) => s + Number(r.latitude), 0) / registrosValidos.length;
        const lonMedia = registrosValidos.reduce((s, r) => s + Number(r.longitude), 0) / registrosValidos.length;
        const distancia = this.calcularDistancia(latitude, longitude, Number(latMedia), Number(lonMedia));
        if (distancia > this.DISTANCIA_MAXIMA_METROS) {
          this.logger.warn(`Localização fora do padrão: func=${funcionarioId}, dist=${distancia.toFixed(0)}m`);
        }
      }
    }
  }

  private calcularHorasTrabalhadas(registros: any[]): number {
    let total = 0;
    for (let i = 0; i < registros.length - 1; i++) {
      if (registros[i].tipo === 'ENTRADA' && registros[i + 1].tipo === 'SAIDA') {
        total += (registros[i + 1].dataHora.getTime() - registros[i].dataHora.getTime()) / 3600000;
      }
    }
    return Math.round(total * 100) / 100;
  }

  private calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
