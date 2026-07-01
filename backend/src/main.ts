import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { SanitizePipe } from './common/sanitize.pipe';
import { UPLOADS_DIR } from './file-upload/file-upload.config';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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
