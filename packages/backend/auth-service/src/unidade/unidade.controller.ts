import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UnidadeService } from './unidade.service';
import { CreateUnidadeDto, UpdateUnidadeDto } from './dto/create-unidade.dto';

@ApiTags('unidades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('unidades')
export class UnidadeController {
  constructor(private readonly unidadeService: UnidadeService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova unidade' })
  create(@Body() dto: CreateUnidadeDto) {
    return this.unidadeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar unidades por empresa' })
  findByCompany(@Query('companyId') companyId: string) {
    return this.unidadeService.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter unidade por ID' })
  findOne(@Param('id') id: string) {
    return this.unidadeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar unidade' })
  update(@Param('id') id: string, @Body() dto: UpdateUnidadeDto) {
    return this.unidadeService.update(id, dto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Ativar/Desativar unidade' })
  toggleStatus(@Param('id') id: string) {
    return this.unidadeService.toggleStatus(id);
  }
}
