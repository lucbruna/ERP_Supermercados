import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FuncionarioService } from './funcionario.service';
import { CreateFuncionarioDto, UpdateFuncionarioDto, FuncionarioQueryDto } from './dto/create-funcionario.dto';

@ApiTags('Funcionários')
@ApiBearerAuth()
@Controller('funcionarios')
export class FuncionarioController {
  constructor(private readonly funcionarioService: FuncionarioService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo funcionário' })
  async create(@Body() dto: CreateFuncionarioDto) {
    return this.funcionarioService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar funcionários' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'departamento', required: false })
  @ApiQuery({ name: 'cargo', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: FuncionarioQueryDto) {
    const companyId = (query as any)['companyId'] || process.env.DEFAULT_COMPANY_ID;
    return this.funcionarioService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter funcionário por ID' })
  async findOne(@Param('id') id: string) {
    return this.funcionarioService.findOne(id);
  }

  @Get('matricula/:matricula')
  @ApiOperation({ summary: 'Obter funcionário por matrícula' })
  async findByMatricula(@Param('matricula') matricula: string) {
    return this.funcionarioService.findByMatricula(matricula);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar funcionário' })
  async update(@Param('id') id: string, @Body() dto: UpdateFuncionarioDto) {
    return this.funcionarioService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do funcionário' })
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.funcionarioService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover funcionário (desativa)' })
  async remove(@Param('id') id: string) {
    return this.funcionarioService.remove(id);
  }
}
