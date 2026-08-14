import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

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
import { LandingCloudinaryService } from './files/cloudinary.service';

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

    // El decorador @Auth() de este controller usa AuthGuard(), que
    // necesita PassportModule disponible en el propio módulo del
    // controller (no alcanza con que lo tenga AuthModule). PassportModule
    // no depende de nada nuestro, así que importarlo acá no reintroduce
    // el ciclo que se evitó arriba con TypeOrmModule.
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [LandingAsesoresController],
  providers: [LandingAsesoresService, LandingCloudinaryService],
  exports: [TypeOrmModule, LandingAsesoresService, LandingCloudinaryService],
})
export class LandingAsesoresModule {}
