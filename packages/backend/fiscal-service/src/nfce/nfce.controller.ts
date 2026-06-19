import { Controller, Get, Post, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NFceService } from './nfce.service';
import { CreateNFceSaidaDto, NFceSaidaQueryDto } from './dto/nfce-saida.dto';
import { EmitirNfceDto, NfceFilterDto } from './dto/nfce-emissao.dto';

@ApiTags('NFC-e')
@Controller('nfce')
export class NFceController {
  constructor(private readonly service: NFceService) {}

  @Post('emitir')
  @ApiOperation({ summary: 'Emitir NFC-e simplificada (PDV)' })
  emitir(@Body() dto: EmitirNfceDto) {
    return this.service.emitir(dto);
  }

  @Post('cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar NFC-e' })
  cancelar(@Body('nfceId') nfceId: string) {
    return this.service.cancelar(nfceId);
  }

  @Get(':chaveAcesso')
  @ApiOperation({ summary: 'Consultar NFC-e por chave de acesso' })
  consultar(@Param('chaveAcesso') chaveAcesso: string) {
    return this.service.consultar(chaveAcesso);
  }

  @Post()
  @ApiOperation({ summary: 'Emitir NFC-e de venda (legado)' })
  criar(@Body() dto: CreateNFceSaidaDto) {
    return this.service.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar NFC-es emitidas' })
  listar(@Query() query: NFceSaidaQueryDto) {
    return this.service.listar(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter NFC-e por ID' })
  obter(@Param('id') id: string) {
    return this.service.obter(id);
  }

  @Post(':id/autorizar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autorizar NFC-e' })
  autorizar(@Param('id') id: string, @Body('protocolo') protocolo: string) {
    return this.service.autorizar(id, protocolo);
  }

  @Post(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar NFC-e (legado)' })
  cancelarPorId(@Param('id') id: string) {
    return this.service.cancelarPorId(id);
  }
}
