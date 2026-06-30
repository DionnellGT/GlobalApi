import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { SendCampaignDto } from '../recipients/dto/recipient.dto';

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una campaña' })
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las campañas' })
  findAll() {
    return this.campaignsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una campaña por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una campaña (solo si es borrador)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCampaignDto) {
    return this.campaignsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una campaña' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignsService.remove(id);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Enviar la campaña a los destinatarios' })
  send(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SendCampaignDto) {
    return this.campaignsService.send(id, dto);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Log de envíos de una campaña' })
  getLogs(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignsService.getLogs(id);
  }
}
