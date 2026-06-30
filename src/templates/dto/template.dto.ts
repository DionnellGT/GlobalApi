import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Newsletter mensual' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'Novedades de {empresa} para ti' })
  @IsString()
  @MinLength(1)
  subject: string;

  @ApiProperty({ example: 'Hola {nombre},\n\nEste mes tenemos...' })
  @IsString()
  @MinLength(10)
  body: string;
}

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {}
