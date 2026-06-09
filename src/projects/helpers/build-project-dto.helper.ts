import { CreateProjectDto } from '../dto/create-project.dto';

const sanitize = (str: string): string =>
  str.toLowerCase().trim().replaceAll(' ', '_').replaceAll("'", '');

export const buildFolderName = (name: string, marca?: string): string => {
  const slug = sanitize(name);
  return marca ? `${sanitize(marca)}_${slug}` : slug;
};

const toUrl = (hostApi: string, folderName: string, file: Express.Multer.File): string =>
  `${hostApi}/files/project/${folderName}/${file.filename}`;

const parseJson = (field: any): any => {
  if (!field) return undefined;
  try { return JSON.parse(field); } catch { return field; }
};

const getFileUrl = (
  files: { [key: string]: Express.Multer.File[] },
  fieldName: string,
  hostApi: string,
  folderName: string,
): string | undefined =>
  files?.[fieldName]?.[0]
    ? toUrl(hostApi, folderName, files[fieldName][0])
    : undefined;

const buildRelationsWithImages = (
  rawItems: any[],
  files: { [key: string]: Express.Multer.File[] },
  filePrefix: string,
  imageField: string,
  hostApi: string,
  folderName: string,
): any[] =>
  rawItems.map((item, i) => ({
    ...item,
    [imageField]: files?.[`${filePrefix}_${i}`]?.[0]
      ? toUrl(hostApi, folderName, files[`${filePrefix}_${i}`][0])
      : item[imageField] ?? null,
  }));

export const buildCreateProjectDto = (
  body: any,
  files: { [key: string]: Express.Multer.File[] },
  hostApi: string,
): CreateProjectDto => {
  const folderName = buildFolderName(body.name, body.marca);

  const centrosRaw: any[] = parseJson(body.centrosUrbanosCercanos) ?? [];
  const atraccionesRaw: any[] = parseJson(body.atraccionesTuristicas) ?? [];

  const url = (fieldName: string) => getFileUrl(files, fieldName, hostApi, folderName);

  return {
    name:             body.name,
    idSlug:           body.idSlug,
    marca:            body.marca,
    orden:            body.orden !== undefined ? parseInt(body.orden) : undefined,
    isActive:         body.isActive !== undefined ? body.isActive === 'true' : undefined,
    linkMapa:         body.linkMapa,
    vistaProyecto360: body.vistaProyecto360,

    centrosUrbanosCercanos: buildRelationsWithImages(
      centrosRaw, files, 'imgCentroUrbano', 'imgCentroUrbano', hostApi, folderName,
    ),
    atraccionesTuristicas: buildRelationsWithImages(
      atraccionesRaw, files, 'imgAtraccionTuristica', 'imgAtraccionTuristica', hostApi, folderName,
    ),

    imageCarrousel:              url('imageCarrousel'),
    imagenBannerPrincipal:       url('imagenBannerPrincipal'),
    imagenBannerPrincipalMobile: url('imagenBannerPrincipalMobile'),
    imagenBaner2:                url('imagenBaner2'),
    imagenMapaFondo:             url('imagenMapaFondo'),
    imagenCentrosUrbanos:        url('imagenCentrosUrbanos'),
    imagenAtraccionesTuristicas: url('imagenAtraccionesTuristicas'),

    imagenesDeCaracteristicas: files?.imagenesDeCaracteristicas?.length
      ? files.imagenesDeCaracteristicas.map(f => toUrl(hostApi, folderName, f))
      : undefined,
    imagenesVistasProyecto: files?.imagenesVistasProyecto?.length
      ? files.imagenesVistasProyecto.map(f => toUrl(hostApi, folderName, f))
      : undefined,
  };
};