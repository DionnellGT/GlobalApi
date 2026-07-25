import { mkdirSync } from 'fs';
import { join } from 'path';
import { Marca } from '../../projects/enums';
import { TipoLista } from '../enums';

// Un solo PDF por marca + tipo, guardado con nombre determinístico
// (ej: "elavellano-cliente.pdf"). Subir uno nuevo simplemente sobrescribe
// el archivo anterior (mismo nombre), cumpliendo el "reemplazar si ya existe"
// sin necesitar una entidad/tabla aparte en la base de datos.

export const BROCHURES_DIR = join(process.cwd(), 'uploads', 'brochures');

// IMPORTANTE: los callbacks de Multer (destination/filename) reciben
// `req.params` ANTES de que corran los pipes de validación de Nest, así
// que acá se valida a mano que marca/tipo sean valores conocidos. Sin esto,
// un request armado a mano con un `marca`/`tipo` arbitrario en la URL
// podría escribir el archivo fuera de la carpeta de brochures (path
// traversal), ya que esos valores se usan para construir el nombre/ruta
// del archivo en disco.
export function isValidMarca(value: string): value is Marca {
  return (Object.values(Marca) as string[]).includes(value);
}

export function isValidTipo(value: string): value is TipoLista {
  return (Object.values(TipoLista) as string[]).includes(value);
}

export function brochureFileName(marca: Marca, tipo: TipoLista): string {
  return `${marca}-${tipo}.pdf`;
}

export function brochureFilePath(marca: Marca, tipo: TipoLista): string {
  return join(BROCHURES_DIR, brochureFileName(marca, tipo));
}

export function brochurePublicUrl(marca: Marca, tipo: TipoLista): string {
  // Servido como archivo estático (ver ServeStaticModule en app.module.ts).
  // Es una ruta relativa: el prefijo global "api" NO se le aplica a los
  // assets estáticos, así que el front debe pedirla contra el host de la
  // Api sin el "/api" (a diferencia de las demás rutas de este controller).
  return `/uploads/brochures/${brochureFileName(marca, tipo)}`;
}

export function ensureBrochuresDir(): void {
  mkdirSync(BROCHURES_DIR, { recursive: true });
}
