import { diskStorage } from 'multer';
import * as fs from 'fs';
import { fileFilter, fileNamer } from '../../files/helpers';
import { buildFolderName } from './build-project-dto.helper';

export const PROJECT_FILE_FIELDS = [
  { name: 'imageCarrousel',             maxCount: 1  },
  { name: 'imagenBannerPrincipal',       maxCount: 1  },
  { name: 'imagenBannerPrincipalMobile', maxCount: 1  },
  { name: 'imagenBaner2',                maxCount: 1  },
  { name: 'imagenMapaFondo',             maxCount: 1  },
  { name: 'imagenCentrosUrbanos',        maxCount: 1  },
  { name: 'imagenAtraccionesTuristicas', maxCount: 1  },
  { name: 'imagenesDeCaracteristicas',   maxCount: 10 },
  { name: 'imagenesVistasProyecto',      maxCount: 10 },
  ...Array.from({ length: 10 }, (_, i) => ({ name: `imgCentroUrbano_${i}`,      maxCount: 1 })),
  ...Array.from({ length: 10 }, (_, i) => ({ name: `imgAtraccionTuristica_${i}`, maxCount: 1 })),
];

export const projectDiskStorage = diskStorage({
  destination: (req, file, cb) => {
    const folderName = buildFolderName(req.body.name, req.body.marca);
    const folderPath = `./static/projects/${folderName}`;
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: fileNamer,
});

export const projectMulterOptions = {
  fileFilter,
  storage: projectDiskStorage,
};