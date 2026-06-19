import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SangriaService } from './sangria.service';
import {
  CreateSangriaDto,
  CreateSuprimentoDto,
  SangriaQueryDto,
  SuprimentoQueryDto,
} from './dto/sangria.dto';

@ApiTags('Sangria e Suprimento')
@ApiBearerAuth()
@Controller()
export class SangriaController {
  constructor(private readonly sangriaService: SangriaService) {}

  @Post('sangrias')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar sangria (retirada de caixa)' })
  async criarSangria(@Body() dto: CreateSangriaDto) {
    return this.sangriaService.criarSangria(dto);
  }

  @Get('sangrias')
  @ApiOperation({ summary: 'Listar sangrias' })
  async listarSangrias(@Query() query: SangriaQueryDto) {
    return this.sangriaService.listarSangrias(query);
  }

  @Get('sangrias/:id')
  @ApiOperation({ summary: 'Obter sangria por ID' })
  async findSangriaById(@Param('id') id: string) {
    return this.sangriaService.findSangriaById(id);
  }

  @Post('suprimentos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar suprimento (reforço de caixa)' })
  async criarSuprimento(@Body() dto: CreateSuprimentoDto) {
    return this.sangriaService.criarSuprimento(dto);
  }

  @Get('suprimentos')
  @ApiOperation({ summary: 'Listar suprimentos' })
  async listarSuprimentos(@Query() query: SuprimentoQueryDto) {
    return this.sangriaService.listarSuprimentos(query);
  }

  @Get('suprimentos/:id')
  @ApiOperation({ summary: 'Obter suprimento por ID' })
  async findSuprimentoById(@Param('id') id: string) {
    return this.sangriaService.findSuprimentoById(id);
  }

  @Get('saldo/:pdvId')
  @ApiOperation({ summary: 'Obter saldo atual do PDV' })
  async getSaldo(@Param('pdvId') pdvId: string) {
    return this.sangriaService.getSaldo(pdvId);
  }
}
