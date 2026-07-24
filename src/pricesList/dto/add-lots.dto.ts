import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LotDto } from './lot.dto';

export class AddLotsDto {

  @ApiProperty({
    type: [LotDto],
    description: 'Uno o más lotes a agregar a la lista de precios existente',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LotDto)
  lots: LotDto[];
}
