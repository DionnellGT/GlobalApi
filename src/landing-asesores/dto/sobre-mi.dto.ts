import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSobreMiDto {
  @ApiProperty({ description: 'Título de la sección "Sobre Mí"' })
  @IsString()
  @MinLength(1)
  titulo: string;

  @ApiProperty({ description: 'Párrafo de presentación', required: false })
  @IsString()
  @IsOptional()
  paragraph?: string;
}

export class UpdateSobreMiDto extends PartialType(CreateSobreMiDto) {}
