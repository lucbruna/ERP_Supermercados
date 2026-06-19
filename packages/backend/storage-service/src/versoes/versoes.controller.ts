import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VersoesService } from './versoes.service';
import { CriarVersaoDto } from './dto/versoes.dto';

@ApiTags('Versões de Arquivos')
@ApiBearerAuth()
@Controller('versoes')
export class VersoesController {
  constructor(private readonly versoesService: VersoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova versão de arquivo' })
  async create(
    @Body() dto: CriarVersaoDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.versoesService.create({ ...dto, criadoPor: userId || 'system' });
  }

  @Get(':arquivoId')
  @ApiOperation({ summary: 'Listar versões de um arquivo' })
  async list(@Param('arquivoId') arquivoId: string) {
    return this.versoesService.list(arquivoId);
  }

  @Post(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar versão anterior' })
  async restore(@Param('id') id: string) {
    return this.versoesService.restore(id);
  }
}
