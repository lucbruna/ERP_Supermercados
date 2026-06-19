import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { VeiculosService } from './veiculos.service';
import { CreateVeiculoDto, UpdateVeiculoDto } from '../dto/veiculo.dto';

@ApiTags('veiculos')
@Controller('veiculos')
export class VeiculosController {
  constructor(private readonly service: VeiculosService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new vehicle' })
  @ApiBody({ type: CreateVeiculoDto })
  create(@Body() dto: CreateVeiculoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all vehicles' })
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vehicle' })
  @ApiBody({ type: UpdateVeiculoDto })
  update(@Param('id') id: string, @Body() dto: UpdateVeiculoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vehicle' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update vehicle status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }
}
