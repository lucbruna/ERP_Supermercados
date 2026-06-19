import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TrocasService } from './trocas.service';
import {
  CreateTrocaDto,
  UpdateTrocaStatusDto,
  TrocaQueryDto,
} from './dto/troca.dto';

@ApiTags('Trocas')
@ApiBearerAuth()
@Controller('trocas')
export class TrocasController {
  constructor(private readonly trocasService: TrocasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar troca/devolução' })
  @ApiResponse({ status: 201, description: 'Troca criada com sucesso' })
  async create(@Body() dto: CreateTrocaDto) {
    return this.trocasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar trocas' })
  async findAll(@Query() query: TrocaQueryDto) {
    return this.trocasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter troca por ID' })
  async findOne(@Param('id') id: string) {
    return this.trocasService.findOne(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar status da troca' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateTrocaStatusDto) {
    return this.trocasService.updateStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover troca' })
  async remove(@Param('id') id: string) {
    return this.trocasService.remove(id);
  }
}
