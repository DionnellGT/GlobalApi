import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MailService } from './mail.service';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('domains')
  @ApiOperation({ summary: 'Lista los dominios de envío disponibles' })
  getDomains() {
    return { domains: this.mailService.getAvailableDomains() };
  }
}
