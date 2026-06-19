import { Controller, Get, Post, Put, Patch, Delete, Param, Query, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CamerasService } from './cameras.service';
import { CriarCameraDto, AtualizarCameraDto, StatusCamera } from './dto/camera.dto';

@ApiTags('Câmeras')
@ApiBearerAuth()
@ApiHeader({ name: 'x-company-id', required: true })
@Controller('cameras')
export class CamerasController {
  constructor(private readonly camerasService: CamerasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar câmeras' })
  async findAll(
    @Headers('x-company-id') companyId: string,
    @Query() query: { page?: number; limit?: number; status?: string; unidadeId?: string; tipo?: string },
  ) {
    return this.camerasService.findAll(companyId, query);
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo do status das câmeras' })
  async resumo(@Headers('x-company-id') companyId: string) {
    return this.camerasService.getResumo(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da câmera' })
  async findOne(@Param('id') id: string) {
    return this.camerasService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Adicionar câmera' })
  async create(
    @Headers('x-company-id') companyId: string,
    @Headers('x-unidade-id') unidadeId: string,
    @Body() dto: CriarCameraDto,
  ) {
    return this.camerasService.create(companyId, unidadeId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar câmera' })
  async update(@Param('id') id: string, @Body() dto: AtualizarCameraDto) {
    return this.camerasService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status da câmera' })
  async updateStatus(@Param('id') id: string, @Body('status') status: StatusCamera) {
    return this.camerasService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover câmera' })
  async remove(@Param('id') id: string) {
    return this.camerasService.remove(id);
  }
}
