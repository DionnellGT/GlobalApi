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
import { RecipientsService } from './recipients.service';
import {
  CreateRecipientDto,
  ImportRecipientsDto,
  UpdateRecipientDto,
} from './dto/recipient.dto';

@ApiTags('Recipients')
@ApiBearerAuth()
@Auth()
@Controller('recipients')
export class RecipientsController {
  constructor(private readonly recipientsService: RecipientsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un destinatario' })
  create(@Body() dto: CreateRecipientDto, @GetUser() user: User) {
    return this.recipientsService.create(dto, user);
  }

  @Post('import')
  @ApiOperation({ summary: 'Importar múltiples destinatarios (desde CSV parseado)' })
  import(@Body() dto: ImportRecipientsDto, @GetUser() user: User) {
    return this.recipientsService.import(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los destinatarios del usuario' })
  findAll(@GetUser() user: User) {
    return this.recipientsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un destinatario por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.recipientsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un destinatario' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRecipientDto,
    @GetUser() user: User,
  ) {
    return this.recipientsService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un destinatario' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.recipientsService.remove(id, user);
  }
}
