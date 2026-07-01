import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RecipientsService } from './recipients.service';
import { CreateRecipientDto, ImportRecipientsDto, UpdateRecipientDto } from './dto/recipient.dto';

@ApiTags('Recipients')
@Controller('recipients')
export class RecipientsController {
  constructor(private readonly recipientsService: RecipientsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un destinatario' })
  create(@Body() dto: CreateRecipientDto) {
    return this.recipientsService.create(dto);
  }

  @Post('import')
  @ApiOperation({ summary: 'Importar múltiples destinatarios' })
  import(@Body() dto: ImportRecipientsDto) {
    return this.recipientsService.import(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los destinatarios' })
  findAll() {
    return this.recipientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un destinatario por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.recipientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un destinatario' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRecipientDto) {
    return this.recipientsService.update(id, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Eliminar todos los destinatarios' })
  removeAll() {
    return this.recipientsService.removeAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un destinatario' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.recipientsService.remove(id);
  }
}
