import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCepDto } from './dto/create-cep.dto';
import axios from 'axios';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  erro?: boolean;
}

@Injectable()
export class CepService {
  private readonly logger = new Logger(CepService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByCep(cep: string) {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) {
      throw new NotFoundException('CEP deve conter 8 dígitos');
    }

    const existing = await this.prisma.cep.findUnique({ where: { cep: cleaned } });
    if (existing) {
      return { success: true, data: existing, origem: 'database' };
    }

    try {
      const { data } = await axios.get<ViaCepResponse>(`https://viacep.com.br/ws/${cleaned}/json/`);
      if (data.erro) {
        throw new NotFoundException('CEP não encontrado');
      }

      const cepData = {
        cep: data.cep.replace(/\D/g, ''),
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
        ibge: data.ibge,
      };

      return { success: true, data: cepData, origem: 'viacep' };
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`ViaCEP error: ${error.message}`);
      throw new NotFoundException('CEP não encontrado');
    }
  }

  async create(dto: CreateCepDto) {
    const existing = await this.prisma.cep.findUnique({ where: { cep: dto.cep } });
    if (existing) {
      throw new ConflictException('CEP já cadastrado');
    }

    const data = await this.prisma.cep.create({ data: dto });
    return { success: true, data };
  }
}
