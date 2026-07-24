import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

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

  @ApiProperty({ description: 'Precio de lista' })
  @IsInt()
  @Min(0)
  priceList: number;

  @ApiProperty({ description: 'Precio con pie + cuotas' })
  @IsInt()
  @Min(0)
  installmentPrice: number;

  @ApiProperty({ description: 'Precio al contado' })
  @IsInt()
  @Min(0)
  cashPrice: number;
}
