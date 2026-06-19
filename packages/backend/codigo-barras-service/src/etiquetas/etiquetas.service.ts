import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateEtiquetaDto, UpdateEtiquetaDto, PreviewEtiquetaDto } from './dto/create-etiqueta.dto';

@Injectable()
export class EtiquetasService {
  private readonly logger = new Logger(EtiquetasService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEtiquetaDto) {
    const etiqueta = await this.prisma.etiqueta.create({ data: dto });
    this.logger.log(`Etiqueta criada: ${etiqueta.nome}`);
    return { success: true, data: etiqueta };
  }

  async findAll() {
    const data = await this.prisma.etiqueta.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { impressoes: true } } },
    });
    return { success: true, data };
  }

  async findOne(id: string) {
    const etiqueta = await this.prisma.etiqueta.findUnique({
      where: { id },
      include: { _count: { select: { impressoes: true } } },
    });
    if (!etiqueta) throw new NotFoundException('Etiqueta não encontrada');
    return { success: true, data: etiqueta };
  }

  async update(id: string, dto: UpdateEtiquetaDto) {
    await this.findOne(id);
    const updated = await this.prisma.etiqueta.update({ where: { id }, data: dto });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.etiqueta.delete({ where: { id } });
    this.logger.log(`Etiqueta removida: ${id}`);
    return { success: true, message: 'Etiqueta removida com sucesso' };
  }

  async preview(id: string, dto: PreviewEtiquetaDto) {
    const etiqueta = await this.findOne(id);
    const campos = etiqueta.data.camposJson ? JSON.parse(etiqueta.data.camposJson) : [];

    const svgContent = campos.map((campo: any) => {
      const valor = dto.campos?.[campo.chave] || `{{${campo.chave}}}`;
      return `<text x="${campo.x || 10}" y="${campo.y || 20}" font-family="Arial" font-size="${campo.fontSize || 12}" fill="black">${valor}</text>`;
    }).join('\n    ');

    const html = `<html>
<head><style>
  body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; }
  .label { width: ${etiqueta.data.largura}mm; height: ${etiqueta.data.altura}mm; background: white; border: 1px solid #ccc; padding: ${etiqueta.data.margemSuperior}mm ${etiqueta.data.margemDireita}mm ${etiqueta.data.margemInferior}mm ${etiqueta.data.margemEsquerda}mm; box-shadow: 0 2px 8px rgba(0,0,0,0.15); position: relative; overflow: hidden; }
  img.barcode { display: block; max-width: 90%; margin: 10px auto; }
  .label-content { font-family: Arial, sans-serif; }
</style></head>
<body>
  <div class="label">
    <div class="label-content">
      ${svgContent}
      <img class="barcode" src="https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(dto.codigoBarras)}&code=Code128&translate-esc=true" alt="barcode" />
    </div>
  </div>
</body>
</html>`;

    return { success: true, data: { html } };
  }

  async imprimir(id: string, produtoIds: string[], quantidade: number) {
    const etiqueta = await this.findOne(id);
    if (!produtoIds || produtoIds.length === 0) {
      throw new NotFoundException('Nenhum produto informado para impressão');
    }

    const job = await this.prisma.impressaoEtiqueta.create({
      data: {
        etiquetaId: id,
        produtoIds: JSON.stringify(produtoIds),
        quantidade,
        usuarioId: 'sistema',
        status: 'Pendente',
      },
    });

    this.logger.log(`Impressão de etiqueta criada: ${job.id} (${produtoIds.length} produtos, ${quantidade} cópias)`);
    return { success: true, data: job };
  }
}
