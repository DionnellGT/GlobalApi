import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Marca } from '../../projects/enums';
import { TipoLista } from '../enums';
import { Lot } from './lot.entity';

@Entity({ name: 'price_lists' })
export class PriceList {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Marca o desarrolladora de la lista', enum: Marca })
  @Column({ type: 'enum', enum: Marca })
  marca: Marca;

  @ApiProperty({ description: 'Tipo de lista', enum: TipoLista })
  @Column({ type: 'enum', enum: TipoLista })
  tipo: TipoLista;

  @ApiProperty({ description: 'Nombre del proyecto/lista de precios' })
  @Column('text')
  name: string;

  @ApiProperty({ required: false, description: 'Descripción del proyecto/lista' })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ required: false, description: 'Link al recorrido 360°' })
  @Column('text', { nullable: true })
  has360Tour: string;

  @OneToMany(() => Lot, (lot) => lot.list, { cascade: true, eager: true })
  lots: Lot[];
}
