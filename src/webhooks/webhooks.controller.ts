import { Body, Controller, Headers, HttpCode, Logger, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { ResendWebhookPayload } from './resend-webhook.types';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger('WebhooksController');

  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly configService: ConfigService,
  ) {}

  @Post('resend')
  @HttpCode(200)
  @ApiOperation({ summary: 'Recibe eventos de Resend (bounce, complaint, delivered)' })
  async handleResend(
    @Body() payload: ResendWebhookPayload,
    @Headers('svix-signature') signature?: string,
  ) {
    const secret = this.configService.get<string>('RESEND_WEBHOOK_SECRET');
    if (secret && !signature) throw new UnauthorizedException('Falta la firma del webhook');
    this.logger.log(`Webhook recibido: ${payload?.type}`);
    await this.webhooksService.handleResendEvent(payload);
    return { received: true };
  }
}
