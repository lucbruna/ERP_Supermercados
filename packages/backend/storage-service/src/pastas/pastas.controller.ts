import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PastasService } from './pastas.service';
import { CriarPastaDto, AtualizarPastaDto } from './dto/pastas.dto';

@ApiTags('Pastas')
@ApiBearerAuth()
@Controller('pastas')
export class PastasController {
  constructor(private readonly pastasService: PastasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar pasta' })
  async create(
    @Body() dto: CriarPastaDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.pastasService.create({ ...dto, criadoPor: userId || 'system' });
  }

  @Get()
  @ApiOperation({ summary: 'Listar pastas' })
  async findAll() {
    return this.pastasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da pasta' })
  async findOne(@Param('id') id: string) {
    return this.pastasService.findOne(id);
  }

  @Get(':id/conteudo')
  @ApiOperation({ summary: 'Conteúdo da pasta (subpastas + arquivos)' })
  async getConteudo(@Param('id') id: string) {
    return this.pastasService.getConteudo(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pasta' })
  async update(
    @Param('id') id: string,
    @Body() dto: AtualizarPastaDto,
  ) {
    return this.pastasService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir pasta' })
  async remove(@Param('id') id: string) {
    return this.pastasService.remove(id);
  }
}
