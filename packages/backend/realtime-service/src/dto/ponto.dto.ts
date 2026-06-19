import { IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';

export class PontoRegisteredDto {
  @IsUUID()
  id: string;

  @IsUUID()
  colaboradorId: string;

  @IsString()
  colaboradorName: string;

  @IsString()
  tipo: 'entrada' | 'saida' | 'almoco_entrada' | 'almoco_saida';

  @IsDateString()
  timestamp: string;

  @IsString()
  @IsOptional()
  origem?: string;
}

export class PontoAlertDto {
  @IsUUID()
  colaboradorId: string;

  @IsString()
  colaboradorName: string;

  @IsString()
  tipo: 'atraso' | 'falta' | 'hora_extra' | 'inconsistencia';

  @IsString()
  message: string;

  @IsDateString()
  @IsOptional()
  data?: string;
}

export class BiometricoAlertDto {
  @IsUUID()
  dispositivoId: string;

  @IsString()
  dispositivoName: string;

  @IsString()
  status: 'offline' | 'error' | 'warning';

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  unidadeId?: string;
}
