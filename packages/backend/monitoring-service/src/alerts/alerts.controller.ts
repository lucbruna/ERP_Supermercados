import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto, UpdateAlertDto, AlertQueryDto } from './dto/alerts.dto';

@ApiTags('Alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new alert' })
  @ApiResponse({ status: 201, description: 'Alert created' })
  async create(@Body() dto: CreateAlertDto) {
    const data = await this.alertsService.create(dto);
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'List all alerts' })
  async findAll(@Query() query: AlertQueryDto) {
    const data = await this.alertsService.findAll(query);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get alert by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.alertsService.findOne(id);
    return { success: true, data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an alert' })
  async update(@Param('id') id: string, @Body() dto: UpdateAlertDto) {
    const data = await this.alertsService.update(id, dto);
    return { success: true, data };
  }

  @Patch(':id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve an alert' })
  async resolve(@Param('id') id: string) {
    const data = await this.alertsService.resolve(id);
    return { success: true, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alert' })
  async remove(@Param('id') id: string) {
    return this.alertsService.remove(id);
  }
}
