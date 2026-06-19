import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AcoesService } from './acoes.service';
import { CreateAcaoDto, UpdateAcaoDto, ExecutarAcaoDto } from './dto/acao.dto';

@ApiTags('acoes')
@Controller('acoes')
export class AcoesController {
  constructor(private readonly service: AcoesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new action definition' })
  create(@Body() dto: CreateAcaoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all action definitions' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get action by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update action' })
  update(@Param('id') id: string, @Body() dto: UpdateAcaoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete action' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/executar')
  @ApiOperation({ summary: 'Manually execute an action' })
  executar(@Param('id') id: string, @Body() dto: ExecutarAcaoDto) {
    return this.service.executar(id, dto);
  }
}
