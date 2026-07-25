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

  @ApiProperty({ required: false, description: 'Precio de lista (opcional)' })
  @Column('int', { nullable: true })
  priceList: number | null;

  @ApiProperty({ required: false, description: 'Precio con pie + cuotas (opcional)' })
  @Column('int', { nullable: true })
  installmentPrice: number | null;

  @ApiProperty({ description: 'Precio al contado' })
  @Column('int')
  cashPrice: number;

  // ← Relación con la lista de precios a la que pertenece el lote.
  // Se llama "list" (y no "priceList") para no chocar con la columna
  // numérica "priceList" (precio de lista) definida arriba.
  @ManyToOne(() => PriceList, (priceList) => priceList.lots, { onDelete: 'CASCADE' })
  list: PriceList;
}
