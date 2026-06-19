import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProcessamentoService } from './processamento.service';
import {
  ProcessarImagemDto,
  ComprimirImagemDto,
  OcrRequestDto,
  PdfPreviewDto,
} from './dto/processamento.dto';

@ApiTags('Processamento de Arquivos')
@ApiBearerAuth()
@Controller('processamento')
export class ProcessamentoController {
  constructor(private readonly processamentoService: ProcessamentoService) {}

  @Post('imagem')
  @ApiOperation({ summary: 'Processar imagem (redimensionar, cortar, rotacionar)' })
  async processarImagem(@Body() dto: ProcessarImagemDto) {
    return this.processamentoService.processarImagem(dto);
  }

  @Post('compress')
  @ApiOperation({ summary: 'Comprimir imagem' })
  async comprimirImagem(@Body() dto: ComprimirImagemDto) {
    return this.processamentoService.comprimirImagem(dto);
  }

  @Post('ocr')
  @ApiOperation({ summary: 'OCR em imagem/documento (simulado)' })
  async ocr(@Body() dto: OcrRequestDto) {
    return this.processamentoService.ocr(dto.arquivoId);
  }

  @Post('pdf-preview')
  @ApiOperation({ summary: 'Gerar thumbnail da primeira página do PDF' })
  async pdfPreview(@Body() dto: PdfPreviewDto) {
    return this.processamentoService.pdfPreview(dto.arquivoId);
  }
}
