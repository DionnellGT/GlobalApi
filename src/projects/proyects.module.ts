import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../auth/auth.module';
import { Project } from './entities/project.entity';
import { CentroUrbano } from './entities/centro-urbano.entity';
import { AtraccionTuristica } from './entities/atraccion-turistica.entity';
import { ProjectsController } from './proyects.controller';
import { ProjectsService } from './proyects.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
  imports: [
    TypeOrmModule.forFeature([Project, CentroUrbano, AtraccionTuristica]),
    AuthModule,
    ConfigModule,
  ],
  exports: [ProjectsService, TypeOrmModule],
})
export class ProjectsModule {}