import { PartialType } from '@nestjs/swagger';
import { CreateCotacaoDto } from './create-cotacao.dto';

export class UpdateCotacaoDto extends PartialType(CreateCotacaoDto) {}
