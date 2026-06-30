import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Template } from './entities/template.entity';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Template]),
    AuthModule,
  ],
  controllers: [TemplatesController],
  providers:   [TemplatesService],
  exports:     [TemplatesService],
})
export class TemplatesModule {}
