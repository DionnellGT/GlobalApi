import { Controller, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { TrackingService } from './tracking.service';

@ApiTags('Tracking')
@Controller('track')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  /**
   * Endpoint que devuelve un GIF 1x1 transparente y registra la apertura.
   * Se incluye como <img> en el HTML del email.
   * NO requiere autenticación — lo llama el cliente de correo del destinatario.
   */
  @Get('open/:sendLogId')
  @ApiOperation({ summary: 'Pixel de tracking de apertura de email' })
  async trackOpen(
    @Param('sendLogId', ParseUUIDPipe) sendLogId: string,
    @Res() res: Response,
  ) {
    // Registrar la apertura (async, sin bloquear la respuesta)
    this.trackingService.registerOpen(sendLogId).catch(() => {});

    // Devolver el pixel inmediatamente
    res.set({
      'Content-Type':  'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma':        'no-cache',
      'Expires':       '0',
    });
    res.send(this.trackingService.getTrackingPixel());
  }
}
