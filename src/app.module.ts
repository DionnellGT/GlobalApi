import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AuthModule }       from './auth/auth.module';
import { ProjectsModule }   from './projects/proyects.module';
import { PricesListModule } from './pricesList/pricesList.module';
import { MailModule }       from './mail/mail.module';
import { RecipientsModule } from './recipients/recipients.module';
import { TemplatesModule }  from './templates/templates.module';
import { CampaignsModule }  from './campaigns/campaigns.module';
import { DashboardModule }  from './dashboard/dashboard.module';
import { WebhooksModule }  from './webhooks/webhooks.module';
import { TrackingModule }  from './tracking/tracking.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod',
      extra: {
        ssl: process.env.STAGE === 'prod'
              ? { rejectUnauthorized: false }
              : null
      },
      type:             'postgres',
      host:             process.env.DB_HOST,
      port:             +process.env.DB_PORT,
      database:         process.env.DB_NAME,
      username:         process.env.DB_USERNAME,
      password:         process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize:      true,
    }),
    // Sirve ./uploads como archivos estáticos en /uploads (ej: PDFs de
    // brochure). OJO: el prefijo global "api" NO se aplica acá (ver
    // pricesList/utils/brochure-storage.util.ts), queda en /uploads/...
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    // módulos existentes — no se tocan
    AuthModule,
    ProjectsModule,
    PricesListModule,
    // MailMasivo — sin @Auth(), sin filtro por usuario
    MailModule,
    RecipientsModule,
    TemplatesModule,
    CampaignsModule,
    DashboardModule,
    WebhooksModule,
    TrackingModule,
  ],
})
export class AppModule {}
