import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { SendCampaignDto } from '../recipients/dto/recipient.dto';

@ApiTags('Campaigns')
@ApiBearerAuth()
@Auth()
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una campaña' })
  create(@Body() dto: CreateCampaignDto, @GetUser() user: User) {
    return this.campaignsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las campañas del usuario' })
  findAll(@GetUser() user: User) {
    return this.campaignsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una campaña por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.campaignsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una campaña (solo si es borrador)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampaignDto,
    @GetUser() user: User,
  ) {
    return this.campaignsService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una campaña' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.campaignsService.remove(id, user);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Enviar la campaña a los destinatarios' })
  send(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendCampaignDto,
    @GetUser() user: User,
  ) {
    return this.campaignsService.send(id, dto, user);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Ver el log de envíos de una campaña' })
  getLogs(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.campaignsService.getLogs(id, user);
  }
}
