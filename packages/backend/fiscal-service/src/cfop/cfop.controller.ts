import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CfopService } from './cfop.service';
import { CreateCfopDto, UpdateCfopDto, CfopQueryDto } from './dto/cfop.dto';

@ApiTags('CFOP')
@Controller('cfop')
export class CfopController {
  constructor(private readonly cfopService: CfopService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar CFOP' })
  create(@Body() dto: CreateCfopDto) {
    return this.cfopService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar CFOPs' })
  findAll(@Query() query: CfopQueryDto) {
    return this.cfopService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter CFOP por ID' })
  findOne(@Param('id') id: string) {
    return this.cfopService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar CFOP' })
  update(@Param('id') id: string, @Body() dto: UpdateCfopDto) {
    return this.cfopService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover CFOP' })
  async remove(@Param('id') id: string) {
    await this.cfopService.remove(id);
  }
}
