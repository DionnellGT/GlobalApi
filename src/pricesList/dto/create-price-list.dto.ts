import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray, IsEnum, IsOptional, IsString, MinLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Marca } from '../../projects/enums';
import { TipoLista } from '../enums';
import { LotDto } from './lot.dto';

export class CreatePriceListDto {

  @ApiProperty({ description: 'Marca o desarrolladora de la lista', enum: Marca })
  @IsEnum(Marca)
  marca: Marca;

  @ApiProperty({ description: 'Tipo de lista', enum: TipoLista })
  @IsEnum(TipoLista)
  tipo: TipoLista;

  @ApiProperty({ description: 'Nombre del proyecto/lista de precios' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ required: false, description: 'Descripción del proyecto/lista' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, description: 'Link al recorrido 360°' })
  @IsString()
  @IsOptional()
  has360Tour?: string;

  @ApiProperty({ required: false, type: [LotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LotDto)
  @IsOptional()
  lots?: LotDto[];
}
