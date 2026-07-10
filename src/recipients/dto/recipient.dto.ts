import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecipientDto {
  @ApiProperty({ example: 'Juan García' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'juan@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: false, example: ['clientes', 'vip'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateRecipientDto extends PartialType(CreateRecipientDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ImportRecipientsDto {
  @ApiProperty({ type: [CreateRecipientDto] })
  @IsArray()
  recipients: CreateRecipientDto[];
}

export class AttachmentDto {
  @ApiProperty({ example: 'documento.pdf' })
  @IsString()
  filename: string;

  @ApiProperty({ description: 'Contenido del archivo en base64' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  contentType: string;
}

export class SendCampaignDto {
  @ApiProperty({
    description: 'Lista de IDs de destinatarios. Si está vacío, se usan todos los activos.',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientIds?: string[];

  @ApiProperty({
    description: 'Adjuntos a incluir en el email',
    required: false,
    type: [AttachmentDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
