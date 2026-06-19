import { Controller, Get, Post, Param, Query, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { ReconhecimentoFacialService } from './reconhecimento-facial.service';
import { ReconhecimentoQueryDto, CriarReconhecimentoDto } from './dto/reconhecimento.dto';

@ApiTags('Reconhecimento Facial')
@ApiBearerAuth()
@ApiHeader({ name: 'x-company-id', required: true })
@Controller('reconhecimento-facial')
export class ReconhecimentoFacialController {
  constructor(private readonly service: ReconhecimentoFacialService) {}

  @Get()
  @ApiOperation({ summary: 'Listar reconhecimentos faciais' })
  async findAll(
    @Headers('x-company-id') companyId: string,
    @Query() query: ReconhecimentoQueryDto,
  ) {
    return this.service.findAll(companyId, query);
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo dos reconhecimentos' })
  async resumo(@Headers('x-company-id') companyId: string) {
    return this.service.getResumo(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do reconhecimento' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar reconhecimento facial' })
  async create(@Body() dto: CriarReconhecimentoDto) {
    return this.service.create(dto);
  }
}
