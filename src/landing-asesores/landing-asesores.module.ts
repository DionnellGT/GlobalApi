import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import {
  LandingBanner,
  LandingSobreMi,
  LandingProyecto,
  LandingTestimonio,
  LandingMisDatos,
} from './entities';
import { LandingAsesoresController } from './landing-asesores.controller';
import { LandingAsesoresService } from './landing-asesores.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LandingBanner,
      LandingSobreMi,
      LandingProyecto,
      LandingTestimonio,
      LandingMisDatos,
    ]),
    AuthModule,
  ],
  controllers: [LandingAsesoresController],
  providers: [LandingAsesoresService],
  exports: [TypeOrmModule, LandingAsesoresService],
})
export class LandingAsesoresModule {}
