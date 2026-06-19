import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Permissões')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: 'Criar permissão' })
  async create(@Body() data: { perfil: string; departamento: string; recurso: string; acao: string }) {
    return this.permissionService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Listar permissões' })
  async findAll(@Query('perfil') perfil?: string, @Query('departamento') departamento?: string) {
    return this.permissionService.findAll({ perfil, departamento });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover permissão' })
  async remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Criar permissões padrão do sistema' })
  async seed() {
    return this.permissionService.seedDefaultPermissions();
  }
}
