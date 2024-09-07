import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(compression());
  await app.listen(process.env.PORT || 3000);
}
bootstrap().catch((e) => {
  Logger.error(`❌  Error starting server. \n ${e}`);
  process.exit(1);
});
