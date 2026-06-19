import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class IbgeService {
  private readonly logger = new Logger(IbgeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listarCidades(uf?: string) {
    const where = uf ? { uf: uf.toUpperCase() } : {};
    const data = await this.prisma.cidadeIbge.findMany({
      where,
      orderBy: { nome: 'asc' },
    });
    return { success: true, data };
  }

  async listarEstados() {
    const estados = [
      { codigo: '12', uf: 'AC', nome: 'Acre', regiao: 'Norte' },
      { codigo: '27', uf: 'AL', nome: 'Alagoas', regiao: 'Nordeste' },
      { codigo: '16', uf: 'AP', nome: 'Amapá', regiao: 'Norte' },
      { codigo: '13', uf: 'AM', nome: 'Amazonas', regiao: 'Norte' },
      { codigo: '29', uf: 'BA', nome: 'Bahia', regiao: 'Nordeste' },
      { codigo: '23', uf: 'CE', nome: 'Ceará', regiao: 'Nordeste' },
      { codigo: '53', uf: 'DF', nome: 'Distrito Federal', regiao: 'Centro-Oeste' },
      { codigo: '32', uf: 'ES', nome: 'Espírito Santo', regiao: 'Sudeste' },
      { codigo: '52', uf: 'GO', nome: 'Goiás', regiao: 'Centro-Oeste' },
      { codigo: '21', uf: 'MA', nome: 'Maranhão', regiao: 'Nordeste' },
      { codigo: '51', uf: 'MT', nome: 'Mato Grosso', regiao: 'Centro-Oeste' },
      { codigo: '50', uf: 'MS', nome: 'Mato Grosso do Sul', regiao: 'Centro-Oeste' },
      { codigo: '31', uf: 'MG', nome: 'Minas Gerais', regiao: 'Sudeste' },
      { codigo: '15', uf: 'PA', nome: 'Pará', regiao: 'Norte' },
      { codigo: '25', uf: 'PB', nome: 'Paraíba', regiao: 'Nordeste' },
      { codigo: '41', uf: 'PR', nome: 'Paraná', regiao: 'Sul' },
      { codigo: '26', uf: 'PE', nome: 'Pernambuco', regiao: 'Nordeste' },
      { codigo: '22', uf: 'PI', nome: 'Piauí', regiao: 'Nordeste' },
      { codigo: '33', uf: 'RJ', nome: 'Rio de Janeiro', regiao: 'Sudeste' },
      { codigo: '24', uf: 'RN', nome: 'Rio Grande do Norte', regiao: 'Nordeste' },
      { codigo: '43', uf: 'RS', nome: 'Rio Grande do Sul', regiao: 'Sul' },
      { codigo: '11', uf: 'RO', nome: 'Rondônia', regiao: 'Norte' },
      { codigo: '14', uf: 'RR', nome: 'Roraima', regiao: 'Norte' },
      { codigo: '42', uf: 'SC', nome: 'Santa Catarina', regiao: 'Sul' },
      { codigo: '35', uf: 'SP', nome: 'São Paulo', regiao: 'Sudeste' },
      { codigo: '28', uf: 'SE', nome: 'Sergipe', regiao: 'Nordeste' },
      { codigo: '17', uf: 'TO', nome: 'Tocantins', regiao: 'Norte' },
    ];
    return { success: true, data: estados };
  }

  async detalheCidade(codigo: string) {
    const data = await this.prisma.cidadeIbge.findUnique({ where: { codigo } });
    if (!data) throw new NotFoundException('Cidade não encontrada');
    return { success: true, data };
  }
}
