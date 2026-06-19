import {
  Controller, Get, Post, Patch, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransferenciasService } from './transferencias.service';
import { CreateTransferenciaDto, TransferenciaQueryDto } from './dto/create-transferencia.dto';

@ApiTags('Transferências de Estoque')
@ApiBearerAuth()
@Controller('transferencias')
export class TransferenciasController {
  constructor(private readonly transferenciasService: TransferenciasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova transferência' })
  async create(@Body() dto: CreateTransferenciaDto) {
    return this.transferenciasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar transferências' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: TransferenciaQueryDto) {
    const companyId = (query as any)['companyId'] || process.env.DEFAULT_COMPANY_ID;
    return this.transferenciasService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter transferência por ID' })
  async findOne(@Param('id') id: string) {
    return this.transferenciasService.findOne(id);
  }

  @Patch(':id/expedir')
  @ApiOperation({ summary: 'Expedir transferência' })
  async expedir(@Param('id') id: string) {
    return this.transferenciasService.expedir(id);
  }

  @Patch(':id/receber')
  @ApiOperation({ summary: 'Receber transferência' })
  async receber(@Param('id') id: string, @Body('responsavelDestinoId') responsavelDestinoId: string) {
    return this.transferenciasService.receber(id, responsavelDestinoId);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar transferência' })
  async cancelar(@Param('id') id: string) {
    return this.transferenciasService.cancelar(id);
  }
}
