import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProyectoDto {
  @ApiProperty({ description: 'Nombre del proyecto' })
  @IsString()
  @MinLength(1)
  nombre: string;

  @ApiProperty({ description: 'Ubicación del proyecto', required: false })
  @IsString()
  @IsOptional()
  ubicacion?: string;

  @ApiProperty({ description: 'Precio del proyecto', required: false })
  @IsString()
  @IsOptional()
  precio?: string;

  @ApiProperty({ description: 'Etiqueta del badge', required: false })
  @IsString()
  @IsOptional()
  badgeLabel?: string;

  @ApiProperty({ description: 'Color del badge', required: false })
  @IsString()
  @IsOptional()
  badgeColor?: string;

  @ApiProperty({ description: 'Lotes disponibles', required: false, default: 0 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  lotesDisponibles?: number;

  @ApiProperty({ description: 'Descripción del proyecto', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Características del proyecto (máximo 8)',
    required: false,
    isArray: true,
    maxItems: 8,
  })
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @IsOptional()
  caracteristicas?: string[];

  @ApiProperty({ description: 'Link a Google Maps', required: false })
  @IsString()
  @IsOptional()
  linkGoogleMaps?: string;

  @ApiProperty({ description: 'Link al recorrido 360', required: false })
  @IsString()
  @IsOptional()
  link360Maps?: string;
}

export class UpdateProyectoDto extends PartialType(CreateProyectoDto) {}
