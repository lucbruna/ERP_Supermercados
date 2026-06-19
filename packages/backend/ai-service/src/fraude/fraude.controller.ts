import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { FraudeService } from './fraude.service';
import { AnalisarTransacaoDto, FraudeQueryDto } from '../dto/fraude.dto';

@ApiTags('fraude')
@Controller('fraude')
export class FraudeController {
  constructor(private readonly service: FraudeService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze a transaction for fraud' })
  @ApiBody({ type: AnalisarTransacaoDto })
  analyze(@Body() dto: AnalisarTransacaoDto) {
    return this.service.analyze(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List fraud detections' })
  findAll(@Query() query: FraudeQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fraud detection by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/processed')
  @ApiOperation({ summary: 'Mark fraud detection as processed' })
  markProcessed(@Param('id') id: string) {
    return this.service.markProcessed(id);
  }
}
