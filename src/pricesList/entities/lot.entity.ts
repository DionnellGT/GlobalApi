import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PriceList } from './price-list.entity';

@Entity({ name: 'price_list_lots' })
export class Lot {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Número del lote' })
  @Column('int')
  lot: number;

  @ApiProperty({ description: 'Tipología del lote' })
  @Column('text')
  typology: string;

  @ApiProperty({ description: 'Superficie del lote en m²' })
  @Column('int')
  area: number;

  @ApiProperty({ description: 'Precio de lista' })
  @Column('int')
  priceList: number;

  @ApiProperty({ description: 'Precio con pie + cuotas' })
  @Column('int')
  installmentPrice: number;

  @ApiProperty({ description: 'Precio al contado' })
  @Column('int')
  cashPrice: number;

  // ← Relación con la lista de precios a la que pertenece el lote.
  // Se llama "list" (y no "priceList") para no chocar con la columna
  // numérica "priceList" (precio de lista) definida arriba.
  @ManyToOne(() => PriceList, (priceList) => priceList.lots, { onDelete: 'CASCADE' })
  list: PriceList;
}
