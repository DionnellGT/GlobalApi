import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

const VALID_DOMAINS = ['elavellano.cl', 'globalterrenos.cl'];

export class CreateCampaignDto {
  @ApiProperty({ example: 'Newsletter Junio' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: '¡Novedades de este mes para ti!' })
  @IsString()
  @MinLength(1)
  subject: string;

  @ApiProperty({ example: 'Hola {nombre}, tenemos novedades...' })
  @IsString()
  @MinLength(10)
  body: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiProperty({ example: 'El Avellano', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  fromName?: string;

  @ApiProperty({
    example: 'elavellano.cl',
    enum: VALID_DOMAINS,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(VALID_DOMAINS, { message: `fromDomain debe ser uno de: ${VALID_DOMAINS.join(', ')}` })
  fromDomain?: string;
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}
