import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FidelidadeService } from './fidelidade.service';
import { CreateFidelidadeDto } from './dto/create-fidelidade.dto';
import { UpdateFidelidadeDto } from './dto/update-fidelidade.dto';

@ApiTags('Fidelidade')
@Controller('fidelidade')
export class FidelidadeController {
  constructor(private readonly fidelidadeService: FidelidadeService) {}

  @Post()
  @ApiOperation({ summary: 'Criar programa de fidelidade' })
  @ApiResponse({ status: 201, description: 'Programa criado com sucesso' })
  create(@Body() dto: CreateFidelidadeDto) {
    return this.fidelidadeService.create(dto);
  }

  @Get('empresa/:companyId')
  @ApiOperation({ summary: 'Listar programas da empresa' })
  @ApiParam({ name: 'companyId', description: 'ID da empresa' })
  findAll(@Param('companyId') companyId: string) {
    return this.fidelidadeService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter programa por ID' })
  @ApiParam({ name: 'id', description: 'ID do programa' })
  findById(@Param('id') id: string) {
    return this.fidelidadeService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar programa' })
  @ApiParam({ name: 'id', description: 'ID do programa' })
  update(@Param('id') id: string, @Body() dto: UpdateFidelidadeDto) {
    return this.fidelidadeService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar programa' })
  @ApiParam({ name: 'id', description: 'ID do programa' })
  async remove(@Param('id') id: string) {
    await this.fidelidadeService.remove(id);
  }

  @Get(':id/regras')
  @ApiOperation({ summary: 'Obter regras do programa' })
  @ApiParam({ name: 'id', description: 'ID do programa' })
  getRegras(@Param('id') id: string) {
    return this.fidelidadeService.getRegras(id);
  }

  @Put(':id/regras')
  @ApiOperation({ summary: 'Atualizar regras do programa' })
  @ApiParam({ name: 'id', description: 'ID do programa' })
  updateRegras(@Param('id') id: string, @Body() regras: any[]) {
    return this.fidelidadeService.updateRegras(id, regras);
  }
}
