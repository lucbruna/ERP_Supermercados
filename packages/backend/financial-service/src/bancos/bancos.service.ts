import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateContaBancariaDto, UpdateContaBancariaDto, MovimentacaoBancariaDto } from './dto/create-conta-bancaria.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BancosService {
  private readonly logger = new Logger(BancosService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContaBancariaDto) {
    const conta = await this.prisma.contaBancaria.create({
      data: {
        companyId: dto.companyId,
        banco: dto.banco,
        codigoBanco: dto.codigoBanco,
        agencia: dto.agencia,
        conta: dto.conta,
        digito: dto.digito,
        tipo: dto.tipo,
        pix: dto.pix || [],
        saldoAtual: new Prisma.Decimal(dto.saldoAtual || 0),
        saldoDisponivel: new Prisma.Decimal(dto.saldoDisponivel || 0),
        limiteChequeEspecial: new Prisma.Decimal(dto.limiteChequeEspecial || 0),
        ativo: dto.ativo ?? true,
      },
    });
    return { success: true, data: conta };
  }

  async findAll(companyId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    const data = await this.prisma.contaBancaria.findMany({
      where,
      orderBy: { banco: 'asc' },
    });
    return { success: true, data };
  }

  async findOne(id: string) {
    const conta = await this.prisma.contaBancaria.findUnique({
      where: { id },
      include: { conciliacoes: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });
    if (!conta) throw new NotFoundException('Conta bancária não encontrada');
    return { success: true, data: conta };
  }

  async update(id: string, dto: UpdateContaBancariaDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.banco) data.banco = dto.banco;
    if (dto.codigoBanco) data.codigoBanco = dto.codigoBanco;
    if (dto.agencia) data.agencia = dto.agencia;
    if (dto.conta) data.conta = dto.conta;
    if (dto.digito) data.digito = dto.digito;
    if (dto.tipo) data.tipo = dto.tipo;
    if (dto.pix) data.pix = dto.pix;
    if (dto.saldoAtual) data.saldoAtual = new Prisma.Decimal(dto.saldoAtual);
    if (dto.saldoDisponivel) data.saldoDisponivel = new Prisma.Decimal(dto.saldoDisponivel);
    if (dto.limiteChequeEspecial) data.limiteChequeEspecial = new Prisma.Decimal(dto.limiteChequeEspecial);
    if (dto.ativo !== undefined) data.ativo = dto.ativo;

    const conta = await this.prisma.contaBancaria.update({ where: { id }, data });
    return { success: true, data: conta };
  }

  async movimentar(id: string, dto: MovimentacaoBancariaDto) {
    const conta = await this.prisma.contaBancaria.findUnique({ where: { id } });
    if (!conta) throw new NotFoundException('Conta bancária não encontrada');
    if (!conta.ativo) throw new BadRequestException('Conta bancária inativa');

    const valor = new Prisma.Decimal(dto.valor);
    const increment = dto.tipo === 'ENTRADA' ? valor : valor.negated();

    const updated = await this.prisma.contaBancaria.update({
      where: { id },
      data: {
        saldoAtual: { increment },
        saldoDisponivel: { increment },
      },
    });

    await this.prisma.lancamentoCaixa.create({
      data: {
        companyId: conta.companyId,
        unidadeId: conta.companyId,
        tipo: dto.tipo === 'ENTRADA' ? 'ENTRADA' : 'SAIDA',
        categoria: dto.categoria || 'MOVIMENTACAO_BANCARIA',
        descricao: dto.descricao,
        valor,
        formaPagamento: dto.formaPagamento,
        dataHora: new Date(),
        operadorId: 'system',
        origem: 'BANCO',
        conciliado: false,
      },
    });

    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contaBancaria.update({
      where: { id },
      data: { ativo: false },
    });
    return { success: true, message: 'Conta bancária desativada com sucesso' };
  }
}
