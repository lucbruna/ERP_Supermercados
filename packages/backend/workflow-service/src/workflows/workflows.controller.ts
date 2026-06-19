import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, UpdateWorkflowDto, WorkflowQueryDto, CloneWorkflowDto } from './dto/workflow.dto';

@ApiTags('workflows')
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly service: WorkflowsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workflow definition' })
  create(@Body() dto: CreateWorkflowDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List workflow definitions' })
  findAll(@Query() query: WorkflowQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workflow' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workflow' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/clonar')
  @ApiOperation({ summary: 'Clone workflow with new version' })
  clone(@Param('id') id: string, @Body() dto: CloneWorkflowDto) {
    return this.service.clone(id, dto);
  }
}
