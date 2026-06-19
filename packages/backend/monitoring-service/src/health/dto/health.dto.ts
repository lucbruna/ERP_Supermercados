import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceStatus } from '@prisma/client';

export class CreateServiceHealthDto {
  @ApiProperty({ example: 'auth-service' })
  @IsString()
  serviceName: string;

  @ApiPropertyOptional({ example: 'http://localhost:3001/health' })
  @IsOptional()
  @IsString()
  endpoint?: string;
}

export class UpdateServiceHealthDto {
  @ApiPropertyOptional({ enum: ServiceStatus })
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  uptime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  responseTime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;
}

export class ServiceHealthQueryDto {
  @ApiPropertyOptional({ enum: ServiceStatus })
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;
}

export class HealthCheckResultDto {
  @ApiProperty()
  @IsString()
  serviceName: string;

  @ApiProperty({ enum: ServiceStatus })
  status: ServiceStatus;

  @ApiProperty()
  @IsNumber()
  responseTime: number;

  @ApiPropertyOptional()
  @IsOptional()
  error?: string;
}

export class BatchHealthCheckDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  services: string[];
}

export class RegisterServiceDto {
  @ApiProperty({ example: 'auth-service' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Auth Service' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ example: 'http://localhost:3001/health' })
  @IsString()
  endpoint: string;
}
