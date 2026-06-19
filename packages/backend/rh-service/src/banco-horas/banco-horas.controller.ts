import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BancoHorasService } from './banco-horas.service';
import { CreateBancoHorasDto, UpdateBancoHorasDto, BancoHorasQueryDto, CreditarHorasDto, DebitarHorasDto } from './dto/create-banco-horas.dto';

@ApiTags('Banco de Horas')
@ApiBearerAuth()
@Controller('banco-horas')
export class BancoHorasController {
  constructor(private readonly bancoHorasService: BancoHorasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar registro de banco de horas' })
  async create(@Body() dto: CreateBancoHorasDto) {
    return this.bancoHorasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar registros de banco de horas' })
  async findAll(@Query() query: BancoHorasQueryDto) {
    return this.bancoHorasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter registro de banco de horas por ID' })
  async findOne(@Param('id') id: string) {
    return this.bancoHorasService.findOne(id);
  }

  @Get('funcionario/:funcionarioId/periodo/:mes/:ano')
  @ApiOperation({ summary: 'Obter banco de horas por funcionário e período' })
  async findByPeriodo(
    @Param('funcionarioId') funcionarioId: string,
    @Param('mes') mes: number,
    @Param('ano') ano: number,
  ) {
    return this.bancoHorasService.findByPeriodo(funcionarioId, mes, ano);
  }

  @Get('funcionario/:funcionarioId/saldo')
  @ApiOperation({ summary: 'Obter saldo atual do banco de horas' })
  async saldoAtual(@Param('funcionarioId') funcionarioId: string) {
    return this.bancoHorasService.saldoAtual(funcionarioId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar registro de banco de horas' })
  async update(@Param('id') id: string, @Body() dto: UpdateBancoHorasDto) {
    return this.bancoHorasService.update(id, dto);
  }

  @Post('creditar')
  @ApiOperation({ summary: 'Creditar horas no banco de horas' })
  async creditarHoras(@Body() dto: CreditarHorasDto) {
    return this.bancoHorasService.creditarHoras(dto);
  }

  @Post('debitar')
  @ApiOperation({ summary: 'Debitar horas do banco de horas' })
  async debitarHoras(@Body() dto: DebitarHorasDto) {
    return this.bancoHorasService.debitarHoras(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover registro de banco de horas' })
  async remove(@Param('id') id: string) {
    return this.bancoHorasService.remove(id);
  }
}
