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
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

@ApiTags('Templates')
@ApiBearerAuth()
@Auth()
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una plantilla de email' })
  create(@Body() dto: CreateTemplateDto, @GetUser() user: User) {
    return this.templatesService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las plantillas del usuario' })
  findAll(@GetUser() user: User) {
    return this.templatesService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una plantilla por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.templatesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una plantilla' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTemplateDto,
    @GetUser() user: User,
  ) {
    return this.templatesService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una plantilla' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.templatesService.remove(id, user);
  }
}
