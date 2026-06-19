import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CepService } from './cep.service';
import { CreateCepDto } from './dto/create-cep.dto';

@ApiTags('CEP')
@Controller('cep')
export class CepController {
  constructor(private readonly cepService: CepService) {}

  @Get(':cep')
  @ApiOperation({ summary: 'Buscar CEP (DB local, fallback ViaCEP)' })
  @ApiParam({ name: 'cep', description: 'CEP com ou sem máscara' })
  @ApiResponse({ status: 200, description: 'CEP encontrado' })
  @ApiResponse({ status: 404, description: 'CEP não encontrado' })
  findByCep(@Param('cep') cep: string) {
    return this.cepService.findByCep(cep);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar CEP manualmente' })
  @ApiResponse({ status: 201, description: 'CEP cadastrado' })
  @ApiResponse({ status: 409, description: 'CEP já existe' })
  create(@Body() dto: CreateCepDto) {
    return this.cepService.create(dto);
  }
}
