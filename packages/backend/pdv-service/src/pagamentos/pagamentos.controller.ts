import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PagamentosService } from './pagamentos.service';
import {
  ProcessarPagamentoDto,
  PagamentoQueryDto,
  EstornarPagamentoDto,
} from './dto/pagamento.dto';

@ApiTags('Pagamentos')
@ApiBearerAuth()
@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post('processar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Processar pagamento (dinheiro/cartão/PIX/vale)' })
  async processar(@Body() dto: ProcessarPagamentoDto) {
    return this.pagamentosService.processar(dto);
  }

  @Post(':id/estornar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Estornar/cancelar um pagamento' })
  async estornar(@Param('id') id: string, @Body() dto: EstornarPagamentoDto) {
    return this.pagamentosService.estornar(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pagamentos' })
  async findAll(@Query() query: PagamentoQueryDto) {
    return this.pagamentosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter pagamento por ID' })
  async findOne(@Param('id') id: string) {
    return this.pagamentosService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pagamento' })
  async remove(@Param('id') id: string) {
    return this.pagamentosService.remove(id);
  }
}
