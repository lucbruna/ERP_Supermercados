import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ImmutableLogService } from './immutable-log.service';

@ApiTags('Immutable Audit Log')
@Controller('immutable-log')
export class ImmutableLogController {
  constructor(private readonly immutableLogService: ImmutableLogService) {}

  @Post('append')
  @ApiOperation({ summary: 'Append a new entry to the immutable audit log' })
  async append(
    @Body() dto: { acao: string; usuarioId: string; dados?: any },
  ) {
    return this.immutableLogService.append(dto);
  }

  @Get('chain')
  @ApiOperation({ summary: 'Get log chain entries (paginated)' })
  async getChain(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const fromIndex = parseInt(from, 10);
    const toIndex = parseInt(to, 10);
    return this.immutableLogService.getRange(fromIndex, toIndex);
  }

  @Get('verify/:id')
  @ApiOperation({ summary: 'Verify integrity of a single log entry' })
  async verifyEntry(@Param('id') id: string) {
    return this.immutableLogService.verifyEntry(parseInt(id, 10));
  }

  @Post('verify-chain')
  @ApiOperation({ summary: 'Verify integrity of the entire log chain' })
  async verifyChain(
    @Body() dto: { fromIndex: number; toIndex: number },
  ) {
    return this.immutableLogService.verifyChain(dto.fromIndex, dto.toIndex);
  }
}
