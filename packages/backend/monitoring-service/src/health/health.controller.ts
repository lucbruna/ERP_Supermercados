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
import { HealthService } from './health.service';
import {
  RegisterServiceDto,
  ServiceHealthQueryDto,
} from './dto/health.dto';
import { ServiceStatus } from '@prisma/client';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'List all service health statuses' })
  async findAll(@Query() query: ServiceHealthQueryDto) {
    const data = await this.healthService.findAll(query);
    return { success: true, data };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get health summary for all services' })
  async summary() {
    return this.healthService.getSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service health by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.healthService.findOne(id);
    return { success: true, data };
  }

  @Get('service/:name')
  @ApiOperation({ summary: 'Get service health by name' })
  async findByServiceName(@Param('name') name: string) {
    const data = await this.healthService.findByServiceName(name);
    return { success: true, data };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new service for health monitoring' })
  @ApiResponse({ status: 201, description: 'Service registered' })
  async register(@Body() dto: RegisterServiceDto) {
    const data = await this.healthService.register(dto);
    return { success: true, data };
  }

  @Post('check/:serviceName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger health check for a specific service' })
  async checkService(@Param('serviceName') serviceName: string) {
    const data = await this.healthService.checkService(serviceName);
    return { success: true, data };
  }

  @Post('check-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger health check for all services' })
  async checkAll() {
    await this.healthService.checkAllServices();
    return { success: true, message: 'Health check triggered' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a service from health monitoring' })
  async remove(@Param('id') id: string) {
    return this.healthService.remove(id);
  }
}
