import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

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
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}
