import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly service: RecommendationService) {}

  @Get('product/:id')
  @ApiOperation({ summary: 'Get product recommendations (cross-sell, up-sell, seasonal)' })
  getProductRecommendations(
    @Param('id') productId: string,
    @Query('limit') limit?: number,
  ) {
    return this.service.getRecommendations(productId, limit || 5);
  }

  @Get('cross-sell/:productId')
  @ApiOperation({ summary: 'Get cross-sell recommendations for a product' })
  getCrossSell(
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    return this.service.getCrossSell(productId, limit || 5);
  }

  @Get('customer/:id')
  @ApiOperation({ summary: 'Get personalized customer recommendations' })
  getCustomerRecommendations(
    @Param('id') customerId: string,
    @Query('limit') limit?: number,
  ) {
    return this.service.getCustomerRecommendations(customerId, limit || 5);
  }
}
