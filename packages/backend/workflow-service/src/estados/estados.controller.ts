import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EstadosService } from './estados.service';
import { CreateEstadoDto, UpdateEstadoDto } from './dto/estado.dto';

@ApiTags('estados')
@Controller('workflows/:workflowId/estados')
export class EstadosController {
  constructor(private readonly service: EstadosService) {}

  @Post()
  @ApiOperation({ summary: 'Add state to workflow' })
  create(@Param('workflowId') workflowId: string, @Body() dto: CreateEstadoDto) {
    return this.service.create(workflowId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List states for workflow' })
  findAll(@Param('workflowId') workflowId: string) {
    return this.service.findAll(workflowId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get state by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update state' })
  update(@Param('id') id: string, @Body() dto: UpdateEstadoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete state' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
