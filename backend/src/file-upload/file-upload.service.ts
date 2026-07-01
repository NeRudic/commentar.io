import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import {
  FILE_UPLOAD_CONFIG,
  MIME_TO_EXT,
  UPLOADS_DIR,
} from './file-upload.config';

export interface ProcessResult {
  path: string;
}

@Injectable()
export class FileUploadService {
  async processFile(file: Express.Multer.File): Promise<ProcessResult> {
    if (
      !FILE_UPLOAD_CONFIG.ALLOWED_TYPES.includes(
        file.mimetype as (typeof FILE_UPLOAD_CONFIG.ALLOWED_TYPES)[number],
      )
    ) {
      throw new BadRequestException(
        'Недопустимый тип файла. Разрешены: txt, jpg, gif, png',
      );
    }

    if (file.mimetype === 'text/plain') {
      if (file.size > FILE_UPLOAD_CONFIG.TXT_MAX_SIZE) {
        throw new BadRequestException(
          'Размер txt-файла не должен превышать 100 КБ',
        );
      }
    }

    const ext = MIME_TO_EXT[file.mimetype];
    const filename =
      Date.now() +
      '-' +
      Math.round(Math.random() * FILE_UPLOAD_CONFIG.RANDOM_RANGE) +
      ext;
    const filePath = join(process.cwd(), UPLOADS_DIR, filename);
    const publicPath = '/uploads/' + filename;

    if (file.mimetype === 'text/plain') {
      await fs.writeFile(filePath, file.buffer);
      return { path: publicPath };
    }

    try {
      const image = sharp(file.buffer);
      const metadata = await image.metadata();

      if (
        metadata.width &&
        metadata.height &&
        (metadata.width > FILE_UPLOAD_CONFIG.MAX_WIDTH ||
          metadata.height > FILE_UPLOAD_CONFIG.MAX_HEIGHT)
      ) {
        await image
          .resize(FILE_UPLOAD_CONFIG.MAX_WIDTH, FILE_UPLOAD_CONFIG.MAX_HEIGHT, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toFile(filePath);
      } else {
        await image.toFile(filePath);
      }

      return { path: publicPath };
    } catch (err) {
      throw new InternalServerErrorException(
        `Ошибка обработки изображения: ${err}`,
      );
    }
  }
}
