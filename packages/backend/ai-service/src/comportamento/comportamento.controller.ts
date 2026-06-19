import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ComportamentoService } from './comportamento.service';
import { AnalisarComportamentoDto, ComportamentoQueryDto } from '../dto/comportamento.dto';

@ApiTags('comportamento')
@Controller('comportamento')
export class ComportamentoController {
  constructor(private readonly service: ComportamentoService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze customer behavior' })
  @ApiBody({ type: AnalisarComportamentoDto })
  analyze(@Body() dto: AnalisarComportamentoDto) {
    return this.service.analyze(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List behavior analyses' })
  findAll(@Query() query: ComportamentoQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get behavior analysis by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete behavior analysis' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
