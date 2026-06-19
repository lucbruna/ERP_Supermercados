import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SecurityAnalyticsService } from './security-analytics.service';
import { Throttle } from '../rate-limit/throttle.decorator';

@ApiTags('Security Analytics')
@Controller('analytics')
@ApiBearerAuth('access-token')
export class SecurityAnalyticsController {
  private readonly logger = new Logger(SecurityAnalyticsController.name);

  constructor(private readonly analyticsService: SecurityAnalyticsService) {}

  @Get('api-usage')
  @Throttle({ limit: 30, window: 60000 })
  @ApiOperation({ summary: 'API key usage statistics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getApiUsage(@Query('days') days?: number) {
    return this.analyticsService.getApiUsage(days || 30);
  }

  @Get('auth-attempts')
  @Throttle({ limit: 30, window: 60000 })
  @ApiOperation({ summary: 'Login attempt statistics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getAuthAttempts(@Query('days') days?: number) {
    return this.analyticsService.getAuthAttempts(days || 7);
  }

  @Get('rate-limits')
  @Throttle({ limit: 30, window: 60000 })
  @ApiOperation({ summary: 'Rate limit hit statistics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getRateLimitHits(@Query('days') days?: number) {
    return this.analyticsService.getRateLimitHits(days || 7);
  }
}
