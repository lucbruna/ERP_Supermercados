import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendEmailDto, TestEmailDto } from '../dto/email.dto';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('enviar')
  @ApiOperation({ summary: 'Send an email manually' })
  @ApiBody({ type: SendEmailDto })
  async send(@Body() dto: SendEmailDto) {
    return this.emailService.send(dto.to, dto.subject, dto.template, dto.context);
  }

  @Post('test')
  @ApiOperation({ summary: 'Test SMTP connection' })
  async testConnection() {
    return this.emailService.testConnection();
  }
}
