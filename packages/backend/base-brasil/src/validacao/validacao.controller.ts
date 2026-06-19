import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ValidacaoService } from './validacao.service';

class CnpjDto {
  cnpj: string;
}

class CpfDto {
  cpf: string;
}

class IeDto {
  inscricaoEstadual: string;
  uf: string;
}

class CepDto {
  cep: string;
}

class NcmDto {
  ncm: string;
}

class CfopDto {
  cfop: string;
  tipo?: string;
}

@ApiTags('Validação')
@Controller('validacao')
export class ValidacaoController {
  constructor(private readonly validacaoService: ValidacaoService) {}

  @Post('cnpj')
  @ApiOperation({ summary: 'Validar CNPJ (dígitos + formato)' })
  @ApiBody({ type: CnpjDto })
  @ApiResponse({ status: 201, description: 'Resultado da validação' })
  validarCnpj(@Body() body: CnpjDto) {
    return this.validacaoService.validarCnpj(body.cnpj);
  }

  @Post('cpf')
  @ApiOperation({ summary: 'Validar CPF (dígitos + formato)' })
  @ApiBody({ type: CpfDto })
  @ApiResponse({ status: 201, description: 'Resultado da validação' })
  validarCpf(@Body() body: CpfDto) {
    return this.validacaoService.validarCpf(body.cpf);
  }

  @Post('inscricao-estadual')
  @ApiOperation({ summary: 'Validar Inscrição Estadual por UF' })
  @ApiBody({ type: IeDto })
  @ApiResponse({ status: 201, description: 'Resultado da validação' })
  validarIe(@Body() body: IeDto) {
    return this.validacaoService.validarInscricaoEstadual(body.inscricaoEstadual, body.uf);
  }

  @Post('cep')
  @ApiOperation({ summary: 'Validar formato do CEP' })
  @ApiBody({ type: CepDto })
  @ApiResponse({ status: 201, description: 'Resultado da validação' })
  validarCep(@Body() body: CepDto) {
    return this.validacaoService.validarCep(body.cep);
  }

  @Post('ncm')
  @ApiOperation({ summary: 'Validar NCM na base' })
  @ApiBody({ type: NcmDto })
  @ApiResponse({ status: 201, description: 'Resultado da validação' })
  validarNcm(@Body() body: NcmDto) {
    return this.validacaoService.validarNcm(body.ncm);
  }

  @Post('cfop')
  @ApiOperation({ summary: 'Validar CFOP para operação' })
  @ApiBody({ type: CfopDto })
  @ApiResponse({ status: 201, description: 'Resultado da validação' })
  validarCfop(@Body() body: CfopDto) {
    return this.validacaoService.validarCfop(body.cfop, body.tipo);
  }
}
