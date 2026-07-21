import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { SanitizePipe } from './common/sanitize.pipe';
import { UPLOADS_DIR } from './file-manager/file-manager.config';
import { join } from 'path';
import { existsSync } from 'fs';
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

  const frontendPath = join(process.cwd(), '..', 'frontend', 'dist');
  if (existsSync(frontendPath)) {
    app.useStaticAssets(frontendPath);
    const express = app.getHttpAdapter().getInstance();
    const apiPrefixes = [
      '/api',
      '/uploads',
      '/users',
      '/comments',
      '/captcha',
      '/file-manager',
      '/comment-and-user',
    ];
    express.use((req, res, next) => {
      if (apiPrefixes.some((p) => req.path.startsWith(p))) {
        return next();
      }
      res.sendFile(join(frontendPath, 'index.html'));
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  throw new Error(`Error: ${err}`);
});
