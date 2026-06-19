import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  Headers,
  Logger,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { UploadFileDto, UploadImageDto } from './dto/upload.dto';

@ApiTags('Upload de Arquivos')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiOperation({ summary: 'Upload de arquivo único' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        pasta: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.uploadService.uploadSingle(
      file,
      dto.pasta,
      dto.tags,
      userId || 'system',
    );
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Upload de múltiplos arquivos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        pasta: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadFileDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.uploadService.uploadMultiple(
      files,
      dto.pasta,
      dto.tags,
      userId || 'system',
    );
  }

  @Post('image')
  @ApiOperation({ summary: 'Upload de imagem com redimensionamento automático' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        pasta: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadImageDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.uploadService.uploadImageWithVariants(
      file,
      dto.pasta,
      dto.tags,
      userId || 'system',
    );
  }
}
