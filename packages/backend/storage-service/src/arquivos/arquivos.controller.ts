import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ArquivosService } from './arquivos.service';
import { FiltrarArquivosDto, AtualizarArquivoDto, MoverArquivoDto } from './dto/arquivos.dto';

@ApiTags('Arquivos')
@ApiBearerAuth()
@Controller('arquivos')
export class ArquivosController {
  constructor(private readonly arquivosService: ArquivosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar arquivos' })
  async findAll(@Query() query: FiltrarArquivosDto) {
    return this.arquivosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do arquivo' })
  async findOne(@Param('id') id: string) {
    return this.arquivosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar metadados do arquivo' })
  async update(
    @Param('id') id: string,
    @Body() dto: AtualizarArquivoDto,
  ) {
    return this.arquivosService.update(id, dto);
  }

  @Patch(':id/mover')
  @ApiOperation({ summary: 'Mover arquivo para outra pasta' })
  async move(
    @Param('id') id: string,
    @Body() dto: MoverArquivoDto,
  ) {
    return this.arquivosService.move(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar arquivo (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.arquivosService.softDelete(id);
  }

  @Post(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar arquivo deletado' })
  async restore(@Param('id') id: string) {
    return this.arquivosService.restore(id);
  }
}
