import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { MENU_ITEM_V1_PACKAGE_NAME } from './generated-types/menu-item';
import { HEALTH_CHECK_V1_PACKAGE_NAME } from './generated-types/health-check';
import { MENU_CATEGORY_V1_PACKAGE_NAME } from './generated-types/menu-category';
import { GrpcExceptionFilter } from './errors/grpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('main.ts');
  const configService = app.get(ConfigService);
  const PORT = configService.get<string>('TRANSPORT_PORT');
  const HOST = configService.get<string>('TRANSPORT_HOST');
  const URL = `${HOST}:${PORT}`;

  app.useGlobalFilters(new GrpcExceptionFilter());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: [MENU_CATEGORY_V1_PACKAGE_NAME, MENU_ITEM_V1_PACKAGE_NAME, HEALTH_CHECK_V1_PACKAGE_NAME],
      protoPath: ['proto/menu-category.proto', 'proto/menu-item.proto', 'proto/health-check.proto'],
      url: URL,
    },
  });
  await app.startAllMicroservices();
  await app.init();
  logger.log('Menu microservice is running on ' + URL);
}
void bootstrap();
