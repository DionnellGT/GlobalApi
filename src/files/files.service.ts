import { existsSync } from 'fs';
import { join } from 'path';

import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FilesService {

  getStaticProjectImage(projectName: string, imageName: string) {
    const path = join(__dirname, '../../static/projects', projectName, imageName);

    if (!existsSync(path))
      throw new BadRequestException(
        `No image '${imageName}' found in project '${projectName}'`,
      );

    return path;
  }
}