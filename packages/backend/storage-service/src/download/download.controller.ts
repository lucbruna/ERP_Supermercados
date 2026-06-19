import {
  Controller,
  Get,
  Head,
  Param,
  Res,
  Req,
  Query,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { DownloadService } from './download.service';

@ApiTags('Download de Arquivos')
@Controller('download')
export class DownloadController {
  private readonly logger = new Logger(DownloadController.name);

  constructor(private readonly downloadService: DownloadService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Download de arquivo' })
  @ApiParam({ name: 'id', description: 'ID do arquivo' })
  @ApiQuery({ name: 'disposition', required: false, description: 'attachment ou inline' })
  async download(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const range = req.headers['range'];
    return this.downloadService.downloadFile(id, res, range);
  }

  @Get(':id/versao/:versao')
  @ApiOperation({ summary: 'Download de versão específica' })
  @ApiParam({ name: 'id', description: 'ID do arquivo' })
  @ApiParam({ name: 'versao', description: 'Número da versão' })
  async downloadVersion(
    @Param('id') id: string,
    @Param('versao') versao: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.downloadService.downloadVersion(id, versao, res);
  }

  @Get(':id/zip')
  @ApiOperation({ summary: 'Download de pasta como ZIP' })
  @ApiParam({ name: 'id', description: 'ID da pasta' })
  async downloadZip(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.downloadService.downloadZip(id, res);
  }

  @Head(':id')
  @ApiOperation({ summary: 'Metadados do arquivo sem download' })
  @ApiParam({ name: 'id', description: 'ID do arquivo' })
  async head(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.downloadService.headFile(id, res);
  }
}
