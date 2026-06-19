import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSegmentoDto } from './create-segmento.dto';

export class UpdateSegmentoDto extends PartialType(
  OmitType(CreateSegmentoDto, ['companyId'] as const),
) {}
