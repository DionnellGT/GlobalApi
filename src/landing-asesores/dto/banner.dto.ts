import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({ description: 'Título principal del banner' })
  @IsString()
  @MinLength(1)
  titulo: string;

  @ApiProperty({ description: 'Subtítulo del banner', required: false })
  @IsString()
  @IsOptional()
  subtitulo?: string;

  @ApiProperty({ description: 'Descripción del banner', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}
