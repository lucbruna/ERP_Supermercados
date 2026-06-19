import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromocoesService } from './promocoes.service';
import { CreatePromocaoDto, UpdatePromocaoDto, PromocaoQueryDto } from './dto/create-promocao.dto';

@ApiTags('Promoções')
@ApiBearerAuth()
@Controller('promocoes')
export class PromocoesController {
  constructor(private readonly promocoesService: PromocoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar promoção' })
  async create(@Body() dto: CreatePromocaoDto) {
    return this.promocoesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar promoções' })
  async findAll(@Query() query: PromocaoQueryDto) {
    const companyId = (query as any)['companyId'] || process.env.DEFAULT_COMPANY_ID;
    return this.promocoesService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter promoção por ID' })
  async findOne(@Param('id') id: string) {
    return this.promocoesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar promoção' })
  async update(@Param('id') id: string, @Body() dto: UpdatePromocaoDto) {
    return this.promocoesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover promoção' })
  async remove(@Param('id') id: string) {
    return this.promocoesService.remove(id);
  }

  @Post(':id/ativar')
  @ApiOperation({ summary: 'Ativar promoção' })
  async ativar(@Param('id') id: string) {
    return this.promocoesService.ativar(id);
  }

  @Post(':id/desativar')
  @ApiOperation({ summary: 'Desativar promoção' })
  async desativar(@Param('id') id: string) {
    return this.promocoesService.desativar(id);
  }
}
