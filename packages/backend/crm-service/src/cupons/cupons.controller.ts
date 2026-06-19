import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CuponsService } from './cupons.service';
import { CreateCupomDto } from './dto/create-cupom.dto';
import { UpdateCupomDto } from './dto/update-cupom.dto';
import { UsarCupomDto } from './dto/usar-cupom.dto';
import { ValidarCupomDto } from './dto/validar-cupom.dto';

@ApiTags('Cupons')
@Controller('cupons')
export class CuponsController {
  constructor(private readonly cuponsService: CuponsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar cupom' })
  @ApiResponse({ status: 201, description: 'Cupom criado com sucesso' })
  create(@Body() dto: CreateCupomDto) {
    return this.cuponsService.create(dto);
  }

  @Get('empresa/:companyId')
  @ApiOperation({ summary: 'Listar cupons da empresa' })
  @ApiParam({ name: 'companyId', description: 'ID da empresa' })
  findAll(@Param('companyId') companyId: string) {
    return this.cuponsService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter cupom por ID' })
  @ApiParam({ name: 'id', description: 'ID do cupom' })
  findById(@Param('id') id: string) {
    return this.cuponsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cupom' })
  @ApiParam({ name: 'id', description: 'ID do cupom' })
  update(@Param('id') id: string, @Body() dto: UpdateCupomDto) {
    return this.cuponsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar cupom' })
  @ApiParam({ name: 'id', description: 'ID do cupom' })
  async remove(@Param('id') id: string) {
    await this.cuponsService.remove(id);
  }

  @Post('validar')
  @ApiOperation({ summary: 'Validar cupom antes do uso' })
  validar(@Body() dto: ValidarCupomDto) {
    return this.cuponsService.validar(dto);
  }

  @Post('usar')
  @ApiOperation({ summary: 'Utilizar cupom em uma venda' })
  usar(@Body() dto: UsarCupomDto) {
    return this.cuponsService.usar(dto);
  }

  @Get(':id/usos')
  @ApiOperation({ summary: 'Listar usos de um cupom' })
  @ApiParam({ name: 'id', description: 'ID do cupom' })
  getUsos(@Param('id') id: string) {
    return this.cuponsService.getUsos(id);
  }
}
