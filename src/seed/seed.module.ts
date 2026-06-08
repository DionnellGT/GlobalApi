import { Module } from '@nestjs/common';

import { AuthModule } from './../auth/auth.module';
import { PROJECTsModule } from './../PROJECTs/PROJECTs.module';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    PROJECTsModule,
    AuthModule,
  ]
})
export class SeedModule {}

