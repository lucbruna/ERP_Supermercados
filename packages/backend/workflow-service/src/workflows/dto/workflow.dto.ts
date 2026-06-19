import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkflowCategoria } from '../../common/enums';

export class CreateWorkflowDto {
  @ApiProperty() @IsString() nome: string;

  @ApiPropertyOptional() @IsOptional() @IsString() descricao?: string;

  @ApiProperty({ enum: WorkflowCategoria }) @IsEnum(WorkflowCategoria) categoria: WorkflowCategoria;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() ativo?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) versao?: number;
}

export class UpdateWorkflowDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() descricao?: string;

  @ApiPropertyOptional({ enum: WorkflowCategoria }) @IsOptional() @IsEnum(WorkflowCategoria) categoria?: WorkflowCategoria;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() ativo?: boolean;
}

export class WorkflowQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() categoria?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() ativo?: string;
}

export class CloneWorkflowDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome?: string;
}
