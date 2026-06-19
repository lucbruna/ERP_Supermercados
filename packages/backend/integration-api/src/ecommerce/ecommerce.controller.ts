import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EcommerceService } from './ecommerce.service';
import { CreateIntegracaoDto, UpdateIntegracaoDto, SincronizarDto } from './dto/ecommerce.dto';

@ApiTags('E-commerce')
@Controller('ecommerce')
export class EcommerceController {
  constructor(private readonly ecommerceService: EcommerceService) {}

  @Post() @ApiOperation({ summary: 'Configurar integração e-commerce' })
  criar(@Body() dto: CreateIntegracaoDto) { return this.ecommerceService.criar(dto); }

  @Get() @ApiOperation({ summary: 'Listar integrações' })
  listar(@Query('companyId') companyId: string) { return this.ecommerceService.listar(companyId); }

  @Get(':id') @ApiOperation({ summary: 'Obter integração' })
  obter(@Param('id') id: string) { return this.ecommerceService.obter(id); }

  @Put(':id') @ApiOperation({ summary: 'Atualizar integração' })
  atualizar(@Param('id') id: string, @Body() dto: UpdateIntegracaoDto) { return this.ecommerceService.atualizar(id, dto); }

  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover integração' })
  async remover(@Param('id') id: string) { await this.ecommerceService.remover(id); }

  @Post(':id/sincronizar') @ApiOperation({ summary: 'Sincronizar dados' })
  sincronizar(@Param('id') id: string, @Body() dto: SincronizarDto) { return this.ecommerceService.sincronizar(id, dto); }

  @Get(':id/logs') @ApiOperation({ summary: 'Logs de sincronização' })
  logs(@Param('id') id: string) { return this.ecommerceService.logs(id); }

  @Post('webhook/:plataforma') @ApiOperation({ summary: 'Webhook para receipt de dados' })
  webhook(@Param('plataforma') plataforma: string, @Body() body: any) { return this.ecommerceService.webhook(plataforma, body); }
}
