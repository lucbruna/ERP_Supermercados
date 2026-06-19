import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto, UpdateEmpresaDto } from './dto/create-empresa.dto';

@ApiTags('empresas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('empresas')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova empresa' })
  create(@Body() dto: CreateEmpresaDto) {
    return this.empresaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as empresas' })
  findAll() {
    return this.empresaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter empresa por ID' })
  findOne(@Param('id') id: string) {
    return this.empresaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar empresa' })
  update(@Param('id') id: string, @Body() dto: UpdateEmpresaDto) {
    return this.empresaService.update(id, dto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Ativar/Desativar empresa' })
  toggleStatus(@Param('id') id: string) {
    return this.empresaService.toggleStatus(id);
  }
}
