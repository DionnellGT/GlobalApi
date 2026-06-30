import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule }       from './auth/auth.module';
import { ProjectsModule }   from './projects/proyects.module';
import { MailModule }       from './mail/mail.module';
import { RecipientsModule } from './recipients/recipients.module';
import { TemplatesModule }  from './templates/templates.module';
import { CampaignsModule }  from './campaigns/campaigns.module';
import { DashboardModule }  from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type:             'postgres',
      host:             process.env.DB_HOST,
      port:             +process.env.DB_PORT,
      database:         process.env.DB_NAME,
      username:         process.env.DB_USERNAME,
      password:         process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize:      true,
    }),
    // módulos existentes — no se tocan
    AuthModule,
    ProjectsModule,
    // MailMasivo — sin @Auth(), sin filtro por usuario
    MailModule,
    RecipientsModule,
    TemplatesModule,
    CampaignsModule,
    DashboardModule,
  ],
})
export class AppModule {}
