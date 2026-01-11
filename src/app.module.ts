import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthCheckModule } from './health-check/health-check.module';
import { PrismaModule } from './prisma/prisma.module';
import { MenuCategoryModule } from './menu-category/menu-category.module';
import { envValidate } from './errors/env-validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local'],
      validate: envValidate,
    }),
    HealthCheckModule,
    PrismaModule,
    MenuCategoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
