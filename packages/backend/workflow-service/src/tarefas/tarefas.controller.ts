import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TarefasService } from './tarefas.service';
import { CreateTarefaDto, TarefaQueryDto } from './dto/tarefa.dto';

@ApiTags('tarefas')
@Controller('tarefas')
export class TarefasController {
  constructor(private readonly service: TarefasService) {}

  @Post()
  @ApiOperation({ summary: 'Manually create a task' })
  create(@Body() dto: CreateTarefaDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks' })
  findAll(@Query() query: TarefaQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/concluir')
  @ApiOperation({ summary: 'Complete a task' })
  concluir(@Param('id') id: string) {
    return this.service.concluir(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
