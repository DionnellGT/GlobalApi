import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

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
}
