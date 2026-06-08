import { existsSync } from 'fs';
import { join } from 'path';

import { Injectable, BadRequestException } from '@nestjs/common';


@Injectable()
export class FilesService {
  
    getStaticProjectImage( imageName: string ) {

        const path = join( __dirname, '../../static/projects', imageName );

        if ( !existsSync(path) ) 
            throw new BadRequestException(`No PROJECT found with image ${ imageName }`);

        return path;
    }


}

