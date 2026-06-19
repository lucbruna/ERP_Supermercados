import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PdvService } from './pdv.service';
import {
  CreatePdvDto,
  UpdatePdvDto,
  AberturaPdvDto,
  FechamentoPdvDto,
  PdvQueryDto,
} from './dto/pdv.dto';
import { PdvStatus } from '@prisma/client';

@ApiTags('PDV - Ponto de Venda')
@ApiBearerAuth()
@Controller('pdv')
export class PdvController {
  constructor(private readonly pdvService: PdvService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo PDV' })
  @ApiResponse({ status: 201, description: 'PDV criado com sucesso' })
  async create(@Body() dto: CreatePdvDto) {
    return this.pdvService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os PDVs' })
  async findAll(@Query() query: PdvQueryDto) {
    return this.pdvService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter PDV por ID' })
  async findOne(@Param('id') id: string) {
    return this.pdvService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar PDV' })
  async update(@Param('id') id: string, @Body() dto: UpdatePdvDto) {
    return this.pdvService.update(id, dto);
  }

  @Post(':id/abertura')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Abrir PDV (início do expediente)' })
  async abrir(@Param('id') id: string, @Body() dto: AberturaPdvDto) {
    return this.pdvService.abrir(id, dto);
  }

  @Post(':id/fechamento')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fechar PDV (fim do expediente)' })
  async fechar(@Param('id') id: string, @Body() dto: FechamentoPdvDto) {
    return this.pdvService.fechar(id, dto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Alterar status do PDV' })
  async alterarStatus(
    @Param('id') id: string,
    @Body('status') status: PdvStatus,
  ) {
    return this.pdvService.alterarStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover PDV' })
  async remove(@Param('id') id: string) {
    return this.pdvService.remove(id);
  }
}
