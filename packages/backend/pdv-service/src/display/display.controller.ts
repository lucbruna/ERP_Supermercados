import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DisplayService } from './display.service';

@ApiTags('Display')
@ApiBearerAuth()
@Controller('display')
export class DisplayController {
  constructor(private readonly displayService: DisplayService) {}

  @Get('venda/:id')
  @ApiOperation({ summary: 'Obter dados formatados para display do cliente' })
  async getVendaDisplay(@Param('id') id: string) {
    return this.displayService.getVendaDisplay(id);
  }
}
