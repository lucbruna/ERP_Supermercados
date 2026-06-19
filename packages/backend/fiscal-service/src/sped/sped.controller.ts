import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SpedService } from './sped.service';
import { GerarSpedDto, GerarSpedContabilDto, SpedHistoricoDto } from './dto/sped.dto';

@ApiTags('SPED')
@Controller('sped')
export class SpedController {
  constructor(private readonly service: SpedService) {}

  @Post('fiscal')
  @ApiOperation({ summary: 'Gerar SPED Fiscal (ECD/EFD) para período' })
  gerarSpedFiscal(@Body() dto: GerarSpedDto) {
    return this.service.gerarSpedFiscal(dto);
  }

  @Post('contabil')
  @ApiOperation({ summary: 'Gerar SPED Contábil (ECF)' })
  gerarSpedContabil(@Body() dto: GerarSpedContabilDto) {
    return this.service.gerarSpedContabil(dto);
  }

  @Post('pis-cofins')
  @ApiOperation({ summary: 'Gerar SPED PIS/COFINS' })
  gerarSpedPisCofins(@Body() dto: GerarSpedDto) {
    return this.service.gerarSpedPisCofins(dto);
  }

  @Get('historico')
  @ApiOperation({ summary: 'Listar SPEDs gerados' })
  historico(@Query() query: SpedHistoricoDto) {
    return this.service.historico(query);
  }

  @Get('fiscal')
  @ApiOperation({ summary: 'Listar SPED Fiscal gerados' })
  listarSpedFiscal(@Query('companyId') companyId: string) {
    return this.service.listarSpedFiscal(companyId);
  }

  @Get('fiscal/:id')
  @ApiOperation({ summary: 'Obter SPED Fiscal por ID' })
  obterSpedFiscal(@Param('id') id: string) {
    return this.service.obterSpedFiscal(id);
  }

  @Get('pis-cofins')
  @ApiOperation({ summary: 'Listar SPED PIS/COFINS gerados' })
  listarSpedPisCofins(@Query('companyId') companyId: string) {
    return this.service.listarSpedPisCofins(companyId);
  }

  @Get('pis-cofins/:id')
  @ApiOperation({ summary: 'Obter SPED PIS/COFINS por ID' })
  obterSpedPisCofins(@Param('id') id: string) {
    return this.service.obterSpedPisCofins(id);
  }
}
