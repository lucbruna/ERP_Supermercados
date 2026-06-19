import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { RenovarContratoDto } from './dto/renovar-contrato.dto';
import { QueryContratoDto } from './dto/query-contrato.dto';

@ApiTags('Contratos de Fornecedores')
@ApiBearerAuth()
@Controller('contratos')
export class ContratosController {
  constructor(private readonly service: ContratosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar contrato' })
  @ApiResponse({ status: 201, description: 'Contrato criado.' })
  create(@Body() dto: CreateContratoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contratos (paginado)' })
  findAll(@Query() query: QueryContratoDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter contrato por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar contrato' })
  update(@Param('id') id: string, @Body() dto: UpdateContratoDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/renovar')
  @ApiOperation({ summary: 'Renovar contrato (encerra atual e cria novo)' })
  renovar(@Param('id') id: string, @Body() dto: RenovarContratoDto) {
    return this.service.renovar(id, dto);
  }

  @Post(':id/suspender')
  @ApiOperation({ summary: 'Suspender contrato' })
  suspender(@Param('id') id: string) {
    return this.service.suspender(id);
  }

  @Post(':id/reativar')
  @ApiOperation({ summary: 'Reativar contrato suspenso' })
  reativar(@Param('id') id: string) {
    return this.service.reativar(id);
  }

  @Post(':id/encerrar')
  @ApiOperation({ summary: 'Encerrar contrato' })
  encerrar(@Param('id') id: string) {
    return this.service.encerrar(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir contrato' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
