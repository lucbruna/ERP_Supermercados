import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ExpedicaoService } from './expedicao.service';
import { CreateExpedicaoDto, UpdateExpedicaoDto } from '../dto/expedicao.dto';

@ApiTags('expedicao')
@Controller('expedicao')
export class ExpedicaoController {
  constructor(private readonly service: ExpedicaoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dispatch' })
  @ApiBody({ type: CreateExpedicaoDto })
  create(@Body() dto: CreateExpedicaoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all dispatches' })
  findAll(@Query('roteirizacaoId') roteirizacaoId?: string) {
    return this.service.findAll(roteirizacaoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispatch by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a dispatch' })
  @ApiBody({ type: UpdateExpedicaoDto })
  update(@Param('id') id: string, @Body() dto: UpdateExpedicaoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a dispatch' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/dispatch')
  @ApiOperation({ summary: 'Confirm dispatch execution' })
  dispatch(@Param('id') id: string) {
    return this.service.dispatch(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a dispatch' })
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }
}
