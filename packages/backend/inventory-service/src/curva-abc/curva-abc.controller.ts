import {
  Controller, Get, Post, Param, Query, Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CurvaAbcService } from './curva-abc.service';
import { CalcularCurvaAbcDto, CurvaAbcQueryDto } from './dto/create-curva-abc.dto';

@ApiTags('Curva ABC')
@ApiBearerAuth()
@Controller('curva-abc')
export class CurvaAbcController {
  constructor(private readonly curvaAbcService: CurvaAbcService) {}

  @Post('calcular')
  @ApiOperation({ summary: 'Calcular curva ABC para um período' })
  async calcular(@Body() dto: CalcularCurvaAbcDto) {
    return this.curvaAbcService.calcular(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar curva ABC' })
  @ApiQuery({ name: 'mes', required: false })
  @ApiQuery({ name: 'ano', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: CurvaAbcQueryDto) {
    const unidadeId = (query as any)['unidadeId'] || process.env.DEFAULT_UNIDADE_ID;
    return this.curvaAbcService.findAll(unidadeId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter registro de curva ABC por ID' })
  async findOne(@Param('id') id: string) {
    return this.curvaAbcService.findOne(id);
  }
}
