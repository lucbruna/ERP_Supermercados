import { PaginatedResult } from '../dto/pagination.dto';

export function paginate<T>(
  data: T[],
  total: number,
  pagina: number,
  limite: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    pagina,
    limite,
    totalPaginas: Math.ceil(total / limite),
  };
}
