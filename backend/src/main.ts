import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SanitizePipe } from './common/sanitize.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new SanitizePipe(),
    new ValidationPipe({ transform: true }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
