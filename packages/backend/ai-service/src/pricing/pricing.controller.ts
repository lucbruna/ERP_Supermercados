import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { PricingSuggestDto, OptimizeDto } from './pricing.dto';

@ApiTags('pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly service: PricingService) {}

  @Post('suggest')
  @ApiOperation({ summary: 'Suggest price for a product based on selected strategy' })
  suggest(@Body() dto: PricingSuggestDto) {
    return this.service.suggest(
      dto.productId,
      dto.strategy,
      dto.costPrice,
      dto.marketPrice,
      dto.desiredMargin,
      dto.demandScore,
    );
  }

  @Post('optimize')
  @ApiOperation({ summary: 'Optimize price to maximize revenue/profit considering elasticity' })
  optimize(@Body() dto: OptimizeDto) {
    return this.service.optimize(
      dto.productId,
      dto.costPrice,
      dto.currentPrice,
      dto.salesVolume,
      dto.competitorPrice,
      dto.elasticity,
    );
  }
}
