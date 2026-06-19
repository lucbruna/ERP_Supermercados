import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { MetricQueryDto } from './dto/metrics.dto';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current system metrics (CPU, memory, disk)' })
  async current() {
    const data = await this.metricsService.getCurrentMetrics();
    return { success: true, data };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get historical system metrics' })
  async history(@Query() query: MetricQueryDto) {
    const data = await this.metricsService.getHistory(query);
    return { success: true, data };
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest collected metrics' })
  async latest() {
    const data = await this.metricsService.getLatest();
    return { success: true, data };
  }
}
