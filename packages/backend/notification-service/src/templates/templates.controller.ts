import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from '../dto/template.dto';

@ApiTags('templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification template' })
  @ApiBody({ type: CreateTemplateDto })
  create(@Body() dto: CreateTemplateDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all templates' })
  findAll(@Query('companyId') companyId?: string, @Query('tipo') tipo?: string) {
    return this.service.findAll(companyId, tipo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a template' })
  @ApiBody({ type: UpdateTemplateDto })
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a template' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
