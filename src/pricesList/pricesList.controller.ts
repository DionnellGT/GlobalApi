import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PricesListService } from './pricesList.service';
import { CreatePriceListDto, UpdatePriceListDto, UpdateLotDto, AddLotsDto } from './dto';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { Marca } from '../projects/enums';
import { TipoLista } from './enums';

@ApiTags('PriceList')
@Controller('price-list')
export class PricesListController {
  constructor(private readonly pricesListService: PricesListService) {}

  @Post()
  @Auth()
  create(@Body() createPriceListDto: CreatePriceListDto) {
    return this.pricesListService.create(createPriceListDto);
  }

  @Get()
  findAll() {
    return this.pricesListService.findAll();
  }

  // Lista todas las listas de precios de una marca
  @Get('brand/:marca')
  findByMarca(@Param('marca') marca: Marca) {
    return this.pricesListService.findByMarca(marca);
  }

  // Lista las listas de precios de una marca filtradas por tipo (postventa/cliente)
  @Get('brand/:marca/:tipo')
  findByMarcaAndTipo(
    @Param('marca') marca: Marca,
    @Param('tipo') tipo: TipoLista,
  ) {
    return this.pricesListService.findByMarcaAndTipo(marca, tipo);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pricesListService.findOne(id);
  }

  // Agrega uno o más lotes nuevos a una lista existente (sin borrar los actuales)
  @Post(':id/lot')
  @Auth(ValidRoles.admin)
  addLots(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addLotsDto: AddLotsDto,
  ) {
    return this.pricesListService.addLots(id, addLotsDto);
  }

  // Edita un lote puntual según su id
  @Patch('lot/:lotId')
  @Auth(ValidRoles.admin)
  updateLot(
    @Param('lotId', ParseUUIDPipe) lotId: string,
    @Body() updateLotDto: UpdateLotDto,
  ) {
    return this.pricesListService.updateLot(lotId, updateLotDto);
  }

  // Edita una lista completa según su id
  @Patch(':id')
  @Auth(ValidRoles.admin)
  updateList(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePriceListDto: UpdatePriceListDto,
  ) {
    return this.pricesListService.updateList(id, updatePriceListDto);
  }

  // Elimina todas las listas de una marca y tipo determinados
  @Delete('brand/:marca/:tipo')
  @Auth(ValidRoles.admin)
  removeAllByMarcaAndTipo(
    @Param('marca') marca: Marca,
    @Param('tipo') tipo: TipoLista,
  ) {
    return this.pricesListService.removeAllByMarcaAndTipo(marca, tipo);
  }

  // Elimina un lote puntual según su id
  @Delete('lot/:lotId')
  @Auth(ValidRoles.admin)
  removeLot(@Param('lotId', ParseUUIDPipe) lotId: string) {
    return this.pricesListService.removeLot(lotId);
  }

  // Elimina una lista completa (y sus lotes) según su id
  @Delete(':id')
  @Auth(ValidRoles.admin)
  removeList(@Param('id', ParseUUIDPipe) id: string) {
    return this.pricesListService.removeList(id);
  }
}
