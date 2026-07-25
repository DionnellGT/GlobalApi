import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class LotDto {

  @ApiProperty({ description: 'Número del lote' })
  @IsInt()
  lot: number;

  @ApiProperty({ description: 'Tipología del lote' })
  @IsString()
  @MinLength(1)
  typology: string;

  @ApiProperty({ description: 'Superficie del lote en m²' })
  @IsInt()
  @Min(0)
  area: number;

  @ApiProperty({ required: false, description: 'Precio de lista (opcional)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  priceList?: number;

  @ApiProperty({ required: false, description: 'Precio con pie + cuotas (opcional)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  installmentPrice?: number;

  @ApiProperty({ description: 'Precio al contado' })
  @IsInt()
  @Min(0)
  cashPrice: number;
}
