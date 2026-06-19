import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateEmpresaFiscalDto, UpdateEmpresaFiscalDto, CertificadoUploadDto, EmpresaFiscalQueryDto } from './dto/empresa-fiscal.dto';

@Injectable()
export class ConfiguracaoService {
  private readonly logger = new Logger(ConfiguracaoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmpresaFiscalDto) {
    const existing = await this.prisma.empresaFiscal.findUnique({ where: { cnpj: dto.cnpj } });
    if (existing) throw new ConflictException('Empresa fiscal já cadastrada com este CNPJ');

    return this.prisma.empresaFiscal.create({
      data: {
        cnpj: dto.cnpj,
        razaoSocial: dto.razaoSocial,
        nomeFantasia: dto.nomeFantasia,
        ie: dto.ie,
        im: dto.im,
        cnae: dto.cnae,
        crt: (dto.crt as any) ?? 'SimplesNacional',
        regimeTributario: dto.regimeTributario,
        certificadoSenha: dto.certificadoSenha,
        cert: (dto.cert as any) ?? 'A1',
        csc: dto.csc,
        cscToken: dto.cscToken,
        idToken: dto.idToken,
        ambiente: (dto.ambiente as any) ?? 'Homologacao',
        uf: dto.uf,
        cidade: dto.cidade,
        ibge: dto.ibge,
        logradouro: dto.logradouro,
        numero: dto.numero,
        bairro: dto.bairro,
        cep: dto.cep,
        telefone: dto.telefone,
        email: dto.email,
      },
    });
  }

  async findAll(query: EmpresaFiscalQueryDto) {
    const where: any = {};
    if (query.cnpj) where.cnpj = { contains: query.cnpj };
    if (query.uf) where.uf = query.uf;
    if (query.ambiente) where.ambiente = query.ambiente;
    return this.prisma.empresaFiscal.findMany({ where, orderBy: { razaoSocial: 'asc' } });
  }

  async findOne(id: string) {
    const empresa = await this.prisma.empresaFiscal.findUnique({ where: { id } });
    if (!empresa) throw new NotFoundException('Empresa fiscal não encontrada');
    return empresa;
  }

  async update(id: string, dto: UpdateEmpresaFiscalDto) {
    await this.findOne(id);
    return this.prisma.empresaFiscal.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.empresaFiscal.delete({ where: { id } });
  }

  async uploadCertificado(dto: CertificadoUploadDto) {
    try {
      const forge = await import('node-forge');
      const p12Asn1 = forge.asn1.fromDer(dto.certificadoBase64);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, dto.senha);
      const keyBag = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
      const certBag = p12.getBags({ bagType: forge.pki.oids.certBag });
      const cert = certBag[forge.pki.oids.certBag]?.[0]?.cert;
      if (!cert) throw new BadRequestException('Certificado não encontrado no arquivo');
      const validade = cert.validity.notAfter;
      const subject = cert.subject.attributes.find(a => a.name === 'commonName')?.value || 'Desconhecido';
      return {
        success: true,
        data: {
          subject,
          validade,
          diasRestantes: Math.floor((validade.getTime() - Date.now()) / 86400000),
        },
      };
    } catch (err: any) {
      this.logger.error(`Erro ao processar certificado: ${err.message}`);
      throw new BadRequestException(`Erro ao processar certificado: ${err.message}`);
    }
  }

  async certificadoInfo(empresaId: string) {
    const empresa = await this.findOne(empresaId);
    if (!empresa.certificadoDigital) throw new BadRequestException('Empresa não possui certificado cadastrado');
    if (!empresa.validadeCertificado) throw new BadRequestException('Validade do certificado não disponível');
    const diasRestantes = Math.floor((empresa.validadeCertificado.getTime() - Date.now()) / 86400000);
    return {
      success: true,
      data: {
        cnpj: empresa.cnpj,
        razaoSocial: empresa.razaoSocial,
        tipo: empresa.cert,
        validade: empresa.validadeCertificado,
        diasRestantes,
        expirado: diasRestantes <= 0,
      },
    };
  }

  async toggleAmbiente(empresaId: string, ambiente: string) {
    const empresa = await this.findOne(empresaId);
    const novoAmbiente = ambiente || (empresa.ambiente === 'Producao' ? 'Homologacao' : 'Producao');
    return this.prisma.empresaFiscal.update({
      where: { id: empresaId },
      data: { ambiente: novoAmbiente as any },
    });
  }
}
