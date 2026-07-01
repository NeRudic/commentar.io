import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import sharp from 'sharp';

const ALLOWED_TYPES = ['text/plain', 'image/jpeg', 'image/gif', 'image/png'];
const TXT_MAX_SIZE = 100 * 1024;
const MAX_WIDTH = 320;
const MAX_HEIGHT = 240;

export interface ProcessResult {
  path: string;
}

@Injectable()
export class FileUploadService {
  async processFile(file: Express.Multer.File): Promise<ProcessResult> {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      await fs.unlink(file.path);
      throw new BadRequestException(
        'Недопустимый тип файла. Разрешены: txt, jpg, gif, png',
      );
    }

    if (file.mimetype === 'text/plain') {
      if (file.size > TXT_MAX_SIZE) {
        await fs.unlink(file.path);
        throw new BadRequestException(
          'Размер txt-файла не должен превышать 100 КБ',
        );
      }
      return { path: '/uploads/' + file.filename };
    }

    try {
      const image = sharp(file.path);
      const metadata = await image.metadata();

      if (
        metadata.width &&
        metadata.height &&
        (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT)
      ) {
        await image
          .resize(MAX_WIDTH, MAX_HEIGHT, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toFile(file.path + '_resized');

        await fs.unlink(file.path);
        await fs.rename(file.path + '_resized', file.path);
      }

      return { path: '/uploads/' + file.filename };
    } catch (err) {
      await fs.unlink(file.path).catch(() => {});
      throw new InternalServerErrorException(
        `Ошибка обработки изображения: ${err}`,
      );
    }
  }
}
