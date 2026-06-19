import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ForecastService } from './forecast.service';
import { SalesForecastDto, InventoryForecastDto, DemandForecastDto } from './forecast.dto';

@ApiTags('forecast')
@Controller('forecast')
export class ForecastController {
  constructor(private readonly service: ForecastService) {}

  @Post('sales')
  @ApiOperation({ summary: 'Generate sales forecast with selected or auto-best method' })
  salesForecast(@Body() dto: SalesForecastDto) {
    return this.service.salesForecast(dto.productId, dto.periods, dto.method, dto.historicalSales);
  }

  @Post('inventory')
  @ApiOperation({ summary: 'Calculate auto-reorder point and inventory forecast' })
  inventoryForecast(@Body() dto: InventoryForecastDto) {
    return this.service.inventoryForecast(dto.productId, dto.currentStock, dto.leadTimeDays, dto.safetyStock, dto.dailySales);
  }

  @Post('demand')
  @ApiOperation({ summary: 'Generate demand forecast for a product' })
  demandForecast(@Body() dto: DemandForecastDto) {
    return this.service.demandForecast(dto.productId, dto.periods, dto.method, dto.historicalDemand);
  }
}
