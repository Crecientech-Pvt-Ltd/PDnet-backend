import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import { Logger } from '@nestjs/common';
import { MorganMiddleware } from './morgan/morgan.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(compression());
  // app.use(MorganMiddleware);
  await app.listen(3000);
}
bootstrap().catch(e => {
	Logger.error(`❌  Error starting server, ${e}`, '', 'Bootstrap', false)
	process.exit(1);
});
