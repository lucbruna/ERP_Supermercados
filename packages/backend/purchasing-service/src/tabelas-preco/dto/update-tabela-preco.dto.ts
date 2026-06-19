import { PartialType } from '@nestjs/swagger';
import { CreateTabelaPrecoDto } from './create-tabela-preco.dto';

export class UpdateTabelaPrecoDto extends PartialType(CreateTabelaPrecoDto) {}
