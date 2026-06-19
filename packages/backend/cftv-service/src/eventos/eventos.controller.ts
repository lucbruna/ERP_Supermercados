import { Controller, Get, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { EventosService } from './eventos.service';
import { EventoQueryDto } from './dto/evento-query.dto';

@ApiTags('Eventos de Câmeras')
@ApiBearerAuth()
@ApiHeader({ name: 'x-company-id', required: true })
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar eventos de câmeras' })
  async findAll(
    @Headers('x-company-id') companyId: string,
    @Query() query: EventoQueryDto,
  ) {
    return this.eventosService.findAll(companyId, query);
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo dos eventos' })
  async resumo(@Headers('x-company-id') companyId: string) {
    return this.eventosService.getResumo(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do evento' })
  async findOne(@Param('id') id: string) {
    return this.eventosService.findOne(id);
  }
}
