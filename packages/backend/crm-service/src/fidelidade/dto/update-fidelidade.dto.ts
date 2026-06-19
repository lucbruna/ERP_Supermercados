import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateFidelidadeDto } from './create-fidelidade.dto';

export class UpdateFidelidadeDto extends PartialType(
  OmitType(CreateFidelidadeDto, ['companyId'] as const),
) {}
