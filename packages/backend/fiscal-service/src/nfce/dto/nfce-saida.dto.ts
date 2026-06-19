import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNFceSaidaDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() unidadeId: string;
  @ApiProperty() @IsString() vendaId: string;
  @ApiProperty() @IsNumber() numero: number;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() serie?: number;
  @ApiProperty() @IsString() chaveAcesso: string;
  @ApiPropertyOptional() @IsOptional() @IsString() protocolo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() destinatarioCpfCnpj?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() destinatarioNome?: string;
  @ApiProperty() @IsNumber() @Min(0) valorNota: number;
  @ApiPropertyOptional() @IsOptional() @IsString() finalidade?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() itens?: any[];
  @ApiPropertyOptional() @IsOptional() @IsArray() pagamentos?: any[];
}

export class NFceSaidaQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() vendaId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() pagina?: number;
  @ApiPropertyOptional({ default: 10 }) @IsOptional() @IsNumber() limite?: number;
}
