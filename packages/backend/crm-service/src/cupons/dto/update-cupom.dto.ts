import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCupomDto } from './create-cupom.dto';

export class UpdateCupomDto extends PartialType(
  OmitType(CreateCupomDto, ['companyId', 'codigo'] as const),
) {}
