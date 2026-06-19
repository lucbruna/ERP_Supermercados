import { IsString, IsUUID, IsOptional, IsArray } from 'class-validator';

export class NotificationDto {
  @IsUUID()
  id: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  severity?: 'info' | 'warning' | 'critical';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetRoles?: string[];

  @IsOptional()
  data?: any;
}

export class CriticalAlertDto {
  @IsUUID()
  id: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  severity: 'critical';

  @IsOptional()
  data?: any;
}
