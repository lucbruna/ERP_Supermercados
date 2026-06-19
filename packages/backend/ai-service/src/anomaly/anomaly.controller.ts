import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnomalyService } from './anomaly.service';
import { DetectDto, PricingAnomalyDto } from './anomaly.dto';

@ApiTags('anomaly')
@Controller('anomaly')
export class AnomalyController {
  constructor(private readonly service: AnomalyService) {}

  @Post('detect')
  @ApiOperation({ summary: 'Detect anomalies in price, sales, or inventory data using statistical methods' })
  detect(@Body() dto: DetectDto) {
    return this.service.detect(dto.type, dto.values, dto.threshold);
  }

  @Post('pricing')
  @ApiOperation({ summary: 'Detect pricing anomalies compared to category average' })
  pricingAnomaly(@Body() dto: PricingAnomalyDto) {
    return this.service.pricingAnomaly(dto.productId, dto.price, dto.category, dto.categoryAveragePrice);
  }
}
