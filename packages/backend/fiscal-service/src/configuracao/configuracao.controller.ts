import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfiguracaoService } from './configuracao.service';
import { CreateEmpresaFiscalDto, UpdateEmpresaFiscalDto, CertificadoUploadDto, EmpresaFiscalQueryDto } from './dto/empresa-fiscal.dto';

@ApiTags('Configuração')
@Controller('configuracao')
export class ConfiguracaoController {
  constructor(private readonly service: ConfiguracaoService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar empresa fiscal' })
  create(@Body() dto: CreateEmpresaFiscalDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar empresas fiscais' })
  findAll(@Query() query: EmpresaFiscalQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter empresa fiscal por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar empresa fiscal' })
  update(@Param('id') id: string, @Body() dto: UpdateEmpresaFiscalDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover empresa fiscal' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }

  @Post('certificado')
  @ApiOperation({ summary: 'Upload certificado digital (base64)' })
  uploadCertificado(@Body() dto: CertificadoUploadDto) {
    return this.service.uploadCertificado(dto);
  }

  @Get(':empresaId/certificado-info')
  @ApiOperation({ summary: 'Obter informações do certificado (validade)' })
  certificadoInfo(@Param('empresaId') empresaId: string) {
    return this.service.certificadoInfo(empresaId);
  }

  @Post('ambiente')
  @ApiOperation({ summary: 'Alternar ambiente produção/homologação' })
  @HttpCode(HttpStatus.OK)
  toggleAmbiente(@Body('empresaId') empresaId: string, @Body('ambiente') ambiente: string) {
    return this.service.toggleAmbiente(empresaId, ambiente);
  }
}
