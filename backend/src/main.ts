import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { SanitizePipe } from './common/sanitize.pipe';
import { UPLOADS_DIR } from './file-manager/file-manager.config';
import { join } from 'path';
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: process.env.CORS_ORIGIN });
  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalPipes(
    new SanitizePipe(),
    new ValidationPipe({ transform: true }),
  );
  app.useStaticAssets(join(process.cwd(), UPLOADS_DIR), {
    prefix: '/uploads',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  throw new Error(`Error: ${err}`);
});
