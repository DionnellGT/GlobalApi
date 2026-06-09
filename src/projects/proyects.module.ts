import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { Project } from './entities';
import { ProjectsController } from './proyects.controller';
import { ProjectsService } from './proyects.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
  imports: [
    TypeOrmModule.forFeature([Project]),
    AuthModule,
    ConfigModule,
  ],
  exports: [
    ProjectsService,
    TypeOrmModule,
  ],
})
export class ProjectsModule {}