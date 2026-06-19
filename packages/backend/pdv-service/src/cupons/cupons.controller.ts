import { Controller, Get, Post, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CuponsService } from './cupons.service';
import { ValidarCupomDto, AplicarCupomDto, CreateCupomDto, CupomQueryDto } from './dto/cupom.dto';

@ApiTags('Cupons')
@ApiBearerAuth()
@Controller('cupons')
export class CuponsController {
  constructor(private readonly cuponsService: CuponsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar cupom de desconto' })
  async create(@Body() dto: CreateCupomDto) {
    return this.cuponsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cupons' })
  async findAll(@Query() query: CupomQueryDto) {
    return this.cuponsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter cupom por ID' })
  async findOne(@Param('id') id: string) {
    return this.cuponsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover cupom' })
  async remove(@Param('id') id: string) {
    return this.cuponsService.remove(id);
  }

  @Post('validar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar cupom de desconto' })
  async validar(@Body() dto: ValidarCupomDto) {
    return this.cuponsService.validar(dto);
  }

  @Post('aplicar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aplicar cupom a uma venda' })
  async aplicar(@Body() dto: AplicarCupomDto) {
    return this.cuponsService.aplicar(dto);
  }
}
