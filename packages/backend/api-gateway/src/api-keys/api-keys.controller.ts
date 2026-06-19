import { Controller, Post, Get, Delete, Param, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsInt, Min } from 'class-validator';
import { ApiKeysService } from './api-keys.service';

class GenerateKeyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @IsIn(['read', 'write', 'admin'])
  permissions?: string;

  @IsOptional()
  @IsString()
  @IsIn(['standard', 'premium'])
  tier?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  expiresInDays?: number;
}

@ApiTags('API Keys')
@Controller('api-keys')
export class ApiKeysController {
  private readonly logger = new Logger(ApiKeysController.name);

  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new API key' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 201, description: 'API key generated (raw key shown only once)' })
  async generate(@Body() dto: GenerateKeyDto) {
    const result = await this.apiKeysService.generateKey(
      dto.name,
      dto.permissions || 'read',
      dto.tier || 'standard',
      dto.expiresInDays,
    );

    this.logger.log(`API key created: ${result.name}`);

    return {
      success: true,
      data: result,
      message: 'Save this raw key now. It will not be shown again.',
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all API keys (masked)' })
  @ApiBearerAuth('access-token')
  async list() {
    const keys = await this.apiKeysService.listKeys();
    return { success: true, data: keys };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get API key details' })
  @ApiBearerAuth('access-token')
  async details(@Param('id') id: string) {
    const key = await this.apiKeysService.getKeyDetails(id);
    return { success: true, data: key };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiBearerAuth('access-token')
  async revoke(@Param('id') id: string) {
    return this.apiKeysService.revokeKey(id);
  }
}
