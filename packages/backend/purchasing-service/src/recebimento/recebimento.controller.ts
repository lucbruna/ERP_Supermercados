import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RecebimentoService } from './recebimento.service';
import { CreateRecebimentoDto } from './dto/create-recebimento.dto';
import { QueryRecebimentoDto } from './dto/query-recebimento.dto';

@ApiTags('Recebimento de Mercadorias')
@ApiBearerAuth()
@Controller('recebimento')
export class RecebimentoController {
  constructor(private readonly service: RecebimentoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar recebimento de mercadoria' })
  @ApiResponse({ status: 201, description: 'Recebimento registrado.' })
  create(@Body() dto: CreateRecebimentoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar recebimentos (paginado)' })
  findAll(@Query() query: QueryRecebimentoDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter recebimento por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover recebimento' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
