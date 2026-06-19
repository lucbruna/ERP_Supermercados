import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { PrevisoesService } from './previsoes.service';
import { GerarPrevisaoDto, PrevisaoQueryDto } from '../dto/previsao.dto';

@ApiTags('previsoes')
@Controller('previsoes')
export class PrevisoesController {
  constructor(private readonly service: PrevisoesService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate sales forecast for a product' })
  @ApiBody({ type: GerarPrevisaoDto })
  generate(@Body() dto: GerarPrevisaoDto) {
    return this.service.generate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all forecasts' })
  findAll(@Query() query: PrevisaoQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get forecast by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a forecast' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
