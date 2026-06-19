import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmpresaFiscalDto {
  @ApiProperty() @IsString() cnpj: string;
  @ApiProperty() @IsString() razaoSocial: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nomeFantasia?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ie?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() im?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cnae?: string;
  @ApiPropertyOptional({ enum: ['SimplesNacional', 'LucroPresumido', 'LucroReal', 'LucroArbitrado'] })
  @IsOptional() @IsString() crt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() regimeTributario?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() certificadoSenha?: string;
  @ApiPropertyOptional({ enum: ['A1', 'A3'] }) @IsOptional() @IsString() cert?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() csc?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cscToken?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() idToken?: string;
  @ApiPropertyOptional({ enum: ['Producao', 'Homologacao'] }) @IsOptional() @IsString() ambiente?: string;
  @ApiProperty() @IsString() uf: string;
  @ApiProperty() @IsString() cidade: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ibge?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logradouro?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numero?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bairro?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cep?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telefone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
}

export class UpdateEmpresaFiscalDto {
  @ApiPropertyOptional() @IsOptional() @IsString() razaoSocial?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nomeFantasia?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ie?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() im?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cnae?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() crt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() regimeTributario?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() certificadoSenha?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cert?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() csc?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cscToken?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() idToken?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ambiente?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() uf?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cidade?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ibge?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logradouro?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numero?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bairro?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cep?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telefone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
}

export class CertificadoUploadDto {
  @ApiProperty({ description: 'Base64 encoded certificate' }) @IsString() certificadoBase64: string;
  @ApiProperty() @IsString() senha: string;
  @ApiPropertyOptional({ enum: ['A1', 'A3'] }) @IsOptional() @IsString() tipo?: string;
}

export class EmpresaFiscalQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() cnpj?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() uf?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ambiente?: string;
}
