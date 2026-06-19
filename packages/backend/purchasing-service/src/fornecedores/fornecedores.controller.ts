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
import { FornecedoresService } from './fornecedores.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
import { QueryFornecedorDto } from './dto/query-fornecedor.dto';

@ApiTags('Fornecedores')
@ApiBearerAuth()
@Controller('fornecedores')
export class FornecedoresController {
  constructor(private readonly service: FornecedoresService) {}

  @Post()
  @ApiOperation({ summary: 'Criar fornecedor' })
  @ApiResponse({ status: 201, description: 'Fornecedor criado com sucesso.' })
  create(@Body() dto: CreateFornecedorDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar fornecedores (paginado)' })
  findAll(@Query() query: QueryFornecedorDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter fornecedor por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar fornecedor' })
  update(@Param('id') id: string, @Body() dto: UpdateFornecedorDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar fornecedor (soft delete)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
