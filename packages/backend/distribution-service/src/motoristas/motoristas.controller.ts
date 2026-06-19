import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { MotoristasService } from './motoristas.service';
import { CreateMotoristaDto, UpdateMotoristaDto } from '../dto/motorista.dto';

@ApiTags('motoristas')
@Controller('motoristas')
export class MotoristasController {
  constructor(private readonly service: MotoristasService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new driver' })
  @ApiBody({ type: CreateMotoristaDto })
  create(@Body() dto: CreateMotoristaDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all drivers' })
  findAll(@Query('companyId') companyId?: string, @Query('ativo') ativo?: string) {
    return this.service.findAll(companyId, ativo === 'true' ? true : ativo === 'false' ? false : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get driver by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a driver' })
  @ApiBody({ type: UpdateMotoristaDto })
  update(@Param('id') id: string, @Body() dto: UpdateMotoristaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a driver' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
