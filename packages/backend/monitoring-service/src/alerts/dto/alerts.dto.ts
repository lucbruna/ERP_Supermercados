import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertSeverity, AlertType } from '@prisma/client';

export class CreateAlertDto {
  @ApiProperty({ enum: AlertType })
  @IsEnum(AlertType)
  type: AlertType;

  @ApiPropertyOptional({ enum: AlertSeverity, default: 'MEDIUM' })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @ApiProperty({ example: 'auth-service is down' })
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;
}

export class UpdateAlertDto {
  @ApiPropertyOptional({ enum: AlertType })
  @IsOptional()
  @IsEnum(AlertType)
  type?: AlertType;

  @ApiPropertyOptional({ enum: AlertSeverity })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  resolved?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;
}

export class AlertQueryDto {
  @ApiPropertyOptional({ enum: AlertType })
  @IsOptional()
  @IsEnum(AlertType)
  type?: AlertType;

  @ApiPropertyOptional({ enum: AlertSeverity })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  resolved?: boolean;
}
