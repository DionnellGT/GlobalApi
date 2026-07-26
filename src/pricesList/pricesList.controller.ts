import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, ParseUUIDPipe, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { PricesListService } from './pricesList.service';
import { CreatePriceListDto, UpdatePriceListDto, UpdateLotDto, AddLotsDto } from './dto';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { Marca } from '../projects/enums';
import { TipoLista } from './enums';
import {
  BROCHURES_DIR, brochureFileName, ensureBrochuresDir, isValidMarca, isValidTipo,
} from './utils/brochure-storage.util';

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

  // Info del PDF de brochure vigente para una marca + tipo (si existe)
  @Get('brand/:marca/:tipo/brochure')
  getBrochureInfo(
    @Param('marca') marca: Marca,
    @Param('tipo') tipo: TipoLista,
  ) {
    return this.pricesListService.getBrochureInfo(marca, tipo);
  }

  // Elimina el PDF de brochure de una marca + tipo (si existe)
  @Delete('brand/:marca/:tipo/brochure')
  @Auth(ValidRoles.admin)
  removeBrochure(
    @Param('marca') marca: Marca,
    @Param('tipo') tipo: TipoLista,
  ) {
    return this.pricesListService.removeBrochure(marca, tipo);
  }

  // Sube (o reemplaza, si ya existía uno) el PDF de brochure de una marca + tipo.
  // Se guarda en disco con nombre determinístico ("marca-tipo.pdf"), así que
  // volver a subir uno simplemente sobrescribe al anterior.
  @Post('brand/:marca/:tipo/brochure')
  @Auth(ValidRoles.admin)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, callback) => {
          const { marca, tipo } = req.params as { marca: string; tipo: string };
          // Los callbacks de Multer corren ANTES de los pipes de Nest, así
          // que acá se valida a mano (ver comentario en brochure-storage.util.ts).
          if (!isValidMarca(marca) || !isValidTipo(tipo)) {
            callback(new BadRequestException('Marca o tipo inválidos'), '');
            return;
          }
          ensureBrochuresDir();
          callback(null, BROCHURES_DIR);
        },
        filename: (req, _file, callback) => {
          const { marca, tipo } = req.params as unknown as { marca: Marca; tipo: TipoLista };
          callback(null, brochureFileName(marca, tipo));
        },
      }),
      // Algunos navegadores/SO reportan un mimetype distinto a
      // "application/pdf" para PDFs válidos (ej. "application/octet-stream"
      // si el archivo viene de ciertas fuentes/nubes). Por eso también se
      // acepta por extensión ".pdf" como respaldo, en vez de rechazar solo
      // por mimetype.
      fileFilter: (_req, file, callback) => {
        const isPdfMimetype = file.mimetype === 'application/pdf';
        const isPdfExtension = file.originalname.toLowerCase().endsWith('.pdf');
        callback(null, isPdfMimetype || isPdfExtension);
      },
      limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
    }),
  )
  uploadBrochure(
    @Param('marca') marca: Marca,
    @Param('tipo') tipo: TipoLista,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'El archivo no se subió: o no se adjuntó ninguno, o no es un PDF válido, ' +
        'o supera el tamaño máximo permitido (30MB).',
      );
    }
    return this.pricesListService.getBrochureInfo(marca, tipo);
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
