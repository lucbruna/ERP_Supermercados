import { Controller, Get, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { GravacoesService } from './gravacoes.service';
import { GravacaoQueryDto } from './dto/gravacao.dto';

@ApiTags('Gravações')
@ApiBearerAuth()
@ApiHeader({ name: 'x-company-id', required: true })
@Controller('gravacoes')
export class GravacoesController {
  constructor(private readonly gravacoesService: GravacoesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar gravações' })
  async findAll(
    @Headers('x-company-id') companyId: string,
    @Query() query: GravacaoQueryDto,
  ) {
    return this.gravacoesService.findAll(companyId, query);
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo das gravações' })
  async resumo(@Headers('x-company-id') companyId: string) {
    return this.gravacoesService.getResumo(companyId);
  }

  @Get('camera/:cameraId')
  @ApiOperation({ summary: 'Gravações por câmera' })
  async findByCamera(
    @Param('cameraId') cameraId: string,
    @Query() query: GravacaoQueryDto,
  ) {
    return this.gravacoesService.findByCamera(cameraId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da gravação' })
  async findOne(@Param('id') id: string) {
    return this.gravacoesService.findOne(id);
  }
}
