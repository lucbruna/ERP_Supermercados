import { Controller, Get, Post, Put, Patch, Delete, Param, Query, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { RegrasService } from './regras.service';
import { CriarRegraDto, AtualizarRegraDto } from './dto/regra.dto';

@ApiTags('Regras de Segurança')
@ApiBearerAuth()
@ApiHeader({ name: 'x-company-id', required: true })
@Controller('regras')
export class RegrasController {
  constructor(private readonly regrasService: RegrasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar regras de segurança' })
  async findAll(
    @Headers('x-company-id') companyId: string,
    @Query() query: { page?: number; limit?: number; tipo?: string; ativo?: boolean },
  ) {
    return this.regrasService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da regra de segurança' })
  async findOne(@Param('id') id: string) {
    return this.regrasService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar regra de segurança' })
  async create(
    @Headers('x-company-id') companyId: string,
    @Body() dto: CriarRegraDto,
  ) {
    return this.regrasService.create(companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar regra de segurança' })
  async update(@Param('id') id: string, @Body() dto: AtualizarRegraDto) {
    return this.regrasService.update(id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Ativar/desativar regra de segurança' })
  async toggle(@Param('id') id: string) {
    return this.regrasService.toggle(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover regra de segurança' })
  async remove(@Param('id') id: string) {
    return this.regrasService.remove(id);
  }
}
