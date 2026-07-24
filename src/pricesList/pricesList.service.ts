import {
  BadRequestException, Injectable, InternalServerErrorException,
  Logger, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreatePriceListDto, UpdatePriceListDto, UpdateLotDto, AddLotsDto } from './dto';
import { PriceList } from './entities/price-list.entity';
import { Lot } from './entities/lot.entity';
import { Marca } from '../projects/enums';
import { TipoLista } from './enums';

@Injectable()
export class PricesListService {
  private readonly logger = new Logger('PricesListService');

  constructor(
    @InjectRepository(PriceList)
    private readonly priceListRepository: Repository<PriceList>,

    @InjectRepository(Lot)
    private readonly lotRepository: Repository<Lot>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createPriceListDto: CreatePriceListDto) {
    const { lots = [], ...listData } = createPriceListDto;

    try {
      const priceList = this.priceListRepository.create({
        ...listData,
        lots: lots.map((lot) => this.lotRepository.create({ ...lot })),
      });

      return await this.priceListRepository.save(priceList);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    return this.priceListRepository.find({
      order: { marca: 'ASC', tipo: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const priceList = await this.priceListRepository.findOne({ where: { id } });

    if (!priceList)
      throw new NotFoundException(`Lista de precios con id "${id}" no encontrada`);

    return priceList;
  }

  // Muestra todas las listas de precios de una marca
  async findByMarca(marca: Marca) {
    const priceLists = await this.priceListRepository.find({
      where: { marca },
      order: { tipo: 'ASC', name: 'ASC' },
    });

    if (!priceLists.length)
      throw new NotFoundException(`No se encontraron listas de precios para la marca "${marca}"`);

    return priceLists;
  }

  // Muestra las listas de precios de una marca filtradas además por tipo
  async findByMarcaAndTipo(marca: Marca, tipo: TipoLista) {
    const priceLists = await this.priceListRepository.find({
      where: { marca, tipo },
      order: { name: 'ASC' },
    });

    if (!priceLists.length)
      throw new NotFoundException(
        `No se encontraron listas de precios para la marca "${marca}" y tipo "${tipo}"`,
      );

    return priceLists;
  }

  // Edita una lista completa según su id (datos generales y, opcionalmente, sus lotes)
  async updateList(id: string, updatePriceListDto: UpdatePriceListDto) {
    const { lots, ...listData } = updatePriceListDto;
    const priceList = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Si vienen lotes nuevos en el body, se reemplazan todos los anteriores
      if (lots) {
        await queryRunner.manager.delete(Lot, { list: { id } });
        priceList.lots = lots.map((lot) =>
          this.lotRepository.create({ ...lot, list: priceList }),
        );
      }

      Object.assign(priceList, listData);

      await queryRunner.manager.save(priceList);
      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  // Agrega uno o más lotes nuevos a una lista existente, sin tocar los que ya tiene
  async addLots(id: string, addLotsDto: AddLotsDto) {
    const priceList = await this.findOne(id);

    try {
      const newLots = addLotsDto.lots.map((lot) =>
        this.lotRepository.create({ ...lot, list: priceList }),
      );

      await this.lotRepository.save(newLots);
      return this.findOne(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // Edita un lote puntual según su id
  async updateLot(lotId: string, updateLotDto: UpdateLotDto) {
    const lot = await this.lotRepository.findOne({ where: { id: lotId } });

    if (!lot)
      throw new NotFoundException(`Lote con id "${lotId}" no encontrado`);

    try {
      Object.assign(lot, updateLotDto);
      return await this.lotRepository.save(lot);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // Elimina una lista completa (y sus lotes en cascada) según su id
  async removeList(id: string) {
    const priceList = await this.findOne(id);
    await this.priceListRepository.remove(priceList);
    return { id, message: 'Lista de precios eliminada correctamente' };
  }

  // Elimina un lote puntual según su id
  async removeLot(lotId: string) {
    const lot = await this.lotRepository.findOne({ where: { id: lotId } });

    if (!lot)
      throw new NotFoundException(`Lote con id "${lotId}" no encontrado`);

    await this.lotRepository.remove(lot);
    return { id: lotId, message: 'Lote eliminado correctamente' };
  }

  // Elimina todas las listas (y sus lotes) de una marca y tipo determinados
  async removeAllByMarcaAndTipo(marca: Marca, tipo: TipoLista) {
    try {
      const result = await this.priceListRepository
        .createQueryBuilder('priceList')
        .delete()
        .where('marca = :marca AND tipo = :tipo', { marca, tipo })
        .execute();

      const deleted = result.affected ?? 0;

      return {
        marca,
        tipo,
        deleted,
        message: `Se eliminaron ${deleted} lista(s) de precios para la marca "${marca}" y tipo "${tipo}"`,
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
