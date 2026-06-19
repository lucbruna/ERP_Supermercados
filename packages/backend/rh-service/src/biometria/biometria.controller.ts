import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BiometriaService } from './biometria.service';
import {
  RegisterDigitalDto, RegisterFaceDto, ValidarBiometriaDto,
  BiometriaQueryDto, BiometriaDeviceDto, SpoofingAlertDto,
} from './dto/biometria.dto';

@ApiTags('Biometria - Ponto Eletrônico')
@ApiBearerAuth()
@Controller('biometria')
export class BiometriaController {
  constructor(private readonly biometriaService: BiometriaService) {}

  @Post('digital/registrar')
  @ApiOperation({ summary: 'Registrar template de digital do funcionário' })
  async registerDigital(@Body() dto: RegisterDigitalDto) {
    return this.biometriaService.registerDigital(dto);
  }

  @Post('face/registrar')
  @ApiOperation({ summary: 'Registrar template facial do funcionário' })
  async registerFace(@Body() dto: RegisterFaceDto) {
    return this.biometriaService.registerFace(dto);
  }

  @Post('validar')
  @ApiOperation({ summary: 'Validar biometria (digital ou facial) para bater ponto' })
  async validarBiometria(@Body() dto: ValidarBiometriaDto) {
    return this.biometriaService.validarBiometria(dto);
  }

  @Post('digital/validar')
  @ApiOperation({ summary: 'Validar digital contra template cadastrado' })
  async validarDigital(@Body() dto: ValidarBiometriaDto) {
    return this.biometriaService.validarDigital(dto);
  }

  @Post('face/validar')
  @ApiOperation({ summary: 'Validar face contra template cadastrado' })
  async validarFace(@Body() dto: ValidarBiometriaDto) {
    return this.biometriaService.validarFace(dto);
  }

  @Post('spoofing/alertar')
  @ApiOperation({ summary: 'Registrar tentativa de spoofing (fraude biométrica)' })
  async reportSpoofing(@Body() dto: SpoofingAlertDto) {
    return this.biometriaService.reportSpoofing(dto);
  }

  @Get('funcionario/:funcionarioId')
  @ApiOperation({ summary: 'Listar biometrias cadastradas do funcionário' })
  async findByFuncionario(@Param('funcionarioId') funcionarioId: string) {
    return this.biometriaService.findByFuncionario(funcionarioId);
  }

  @Get('dispositivos')
  @ApiOperation({ summary: 'Listar dispositivos biométricos' })
  @ApiQuery({ name: 'unidadeId', required: false })
  async listDevices(@Query('unidadeId') unidadeId?: string) {
    return this.biometriaService.listDevices(unidadeId);
  }

  @Post('dispositivos')
  @ApiOperation({ summary: 'Registrar dispositivo biométrico' })
  async registerDevice(@Body() dto: BiometriaDeviceDto) {
    return this.biometriaService.registerDevice(dto);
  }

  @Patch('dispositivos/:id')
  @ApiOperation({ summary: 'Atualizar dispositivo biométrico' })
  async updateDevice(@Param('id') id: string, @Body() dto: Partial<BiometriaDeviceDto>) {
    return this.biometriaService.updateDevice(id, dto);
  }

  @Delete('dispositivos/:id')
  @ApiOperation({ summary: 'Remover dispositivo biométrico' })
  async removeDevice(@Param('id') id: string) {
    return this.biometriaService.removeDevice(id);
  }

  @Get('tentativas/:funcionarioId')
  @ApiOperation({ summary: 'Histórico de tentativas biométricas' })
  async tentativasHistory(@Param('funcionarioId') funcionarioId: string) {
    return this.biometriaService.tentativasHistory(funcionarioId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover template biométrico' })
  async remove(@Param('id') id: string) {
    return this.biometriaService.remove(id);
  }
}
