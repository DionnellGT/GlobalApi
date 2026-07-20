import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUrl, Min, MinLength, ValidateNested, IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Marca } from '../enums';


class CentroUrbanoDto {
  @IsString() nombre: string;
  @IsString() distancia: string;
  @IsString() tiempo: string;
  @IsString() @IsOptional() linkMaps?: string;
  @IsString() @IsOptional() imgCentroUrbano?: string;
}

class AtraccionTuristicaDto {
  @IsString() nombre: string;
  @IsString() tiempo: string;
  @IsString() distancia: string;
  @IsString() @IsOptional() linkMaps?: string;
  @IsString() @IsOptional() imgAtraccionTuristica?: string;
}

export class CreateProjectDto {

  @ApiProperty({ description: 'Nombre del proyecto' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ description: 'Precio desde', required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  preciosDesde?: string;

  @ApiProperty({ description: 'Orden de visualización', required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  orden?: number;

  @ApiProperty({ description: 'Estado activo del proyecto', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Slug único (se autogenera si no se envía)', required: false })
  @IsString()
  @IsOptional()
  idSlug?: string;

  @ApiProperty({ description: 'Marca o desarrolladora del proyecto', required: false, enum: Marca })
  @IsEnum(Marca)
  @IsOptional()
  marca?: Marca;

  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  imageCarrousel?: string;

  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  imagenBannerPrincipal?: string;

  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  imagenBannerPrincipalMobile?: string;

  @ApiProperty({ required: false, isArray: true })
  @IsArray() @IsString({ each: true }) @IsOptional()
  imagenesDeCaracteristicas?: string[];

  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  vistaProyecto360?: string;

  @ApiProperty({ required: false, isArray: true })
  @IsArray() @IsString({ each: true }) @IsOptional()
  imagenesVistasProyecto?: string[];

  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  imagenMapaFondo?: string;

  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  linkMapa?: string;

  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  imagenBaner2?: string;

  @ApiProperty({ required: false, type: [CentroUrbanoDto] })
  @IsArray() @ValidateNested({ each: true })
  @Type(() => CentroUrbanoDto) @IsOptional()
  centrosUrbanosCercanos?: CentroUrbanoDto[];

  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  imagenCentrosUrbanos?: string;

  @ApiProperty({ required: false, type: [AtraccionTuristicaDto] })
  @IsArray() @ValidateNested({ each: true })
  @Type(() => AtraccionTuristicaDto) @IsOptional()
  atraccionesTuristicas?: AtraccionTuristicaDto[];

  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  imagenAtraccionesTuristicas?: string;
}