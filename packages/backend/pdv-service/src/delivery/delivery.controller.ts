import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto, UpdateDeliveryDto, DeliveryQueryDto } from './dto/delivery.dto';

@ApiTags('Delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post()
  @ApiOperation({ summary: 'Criar delivery' })
  create(@Body() dto: CreateDeliveryDto) { return this.deliveryService.create(dto); }

  @Get()
  @ApiOperation({ summary: 'Listar deliveries' })
  findAll(@Query() query: DeliveryQueryDto) { return this.deliveryService.findAll(query); }

  @Get(':id')
  @ApiOperation({ summary: 'Obter delivery por ID' })
  findOne(@Param('id') id: string) { return this.deliveryService.findOne(id); }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar delivery (status, entregador)' })
  update(@Param('id') id: string, @Body() dto: UpdateDeliveryDto) { return this.deliveryService.update(id, dto); }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover delivery' })
  async remove(@Param('id') id: string) { await this.deliveryService.remove(id); }
}
