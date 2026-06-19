import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateEnderecoEntregaDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clienteId?: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty() @IsString() cep: string;
  @ApiProperty() @IsString() logradouro: string;
  @ApiProperty() @IsString() numero: string;
  @ApiPropertyOptional() @IsOptional() @IsString() complemento?: string;
  @ApiProperty() @IsString() bairro: string;
  @ApiProperty() @IsString() cidade: string;
  @ApiProperty() @IsString() estado: string;
  @ApiProperty() @IsString() contato: string;
  @ApiPropertyOptional() @IsOptional() coordenadas?: any;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}

export class UpdateEnderecoEntregaDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cep?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logradouro?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numero?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() complemento?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bairro?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cidade?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() estado?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contato?: string;
  @ApiPropertyOptional() @IsOptional() coordenadas?: any;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}
