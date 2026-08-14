import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../auth/entities/user.entity';
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
    // Se registra el repositorio de User directamente en este módulo (en
    // vez de importar AuthModule) para evitar una dependencia circular:
    // AuthModule necesita LandingAsesoresService (para crear los
    // placeholders al registrar un asesor) y LandingAsesoresService
    // necesita el repositorio de User.
    TypeOrmModule.forFeature([
      User,
      LandingBanner,
      LandingSobreMi,
      LandingProyecto,
      LandingTestimonio,
      LandingMisDatos,
    ]),
  ],
  controllers: [LandingAsesoresController],
  providers: [LandingAsesoresService],
  exports: [TypeOrmModule, LandingAsesoresService],
})
export class LandingAsesoresModule {}
