import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';


import { Project, ProjectImage } from './entities';
import { ProjectsController } from './proyects.controller';
import { ProjectsService } from './proyects.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
  imports: [
    TypeOrmModule.forFeature([ Project, ProjectImage ]),
    AuthModule,
  ],
  exports: [
    ProjectsService,
    TypeOrmModule,
  ]
})
export class ProjectsModule {}

