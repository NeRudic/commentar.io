import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

const TXT_MAX_SIZE = 100 * 1024;
const MAX_WIDTH = 320;
const MAX_HEIGHT = 240;
const UPLOADS_DIR = join(process.cwd(), 'uploads');

const MIME_TO_EXT: Record<string, string> = {
  'text/plain': '.txt',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/png': '.png',
};

export interface ProcessResult {
  path: string;
}

@Injectable()
export class FileUploadService {
  async processFile(file: Express.Multer.File): Promise<ProcessResult> {
    if (file.mimetype === 'text/plain') {
      if (file.size > TXT_MAX_SIZE) {
        throw new BadRequestException(
          'Размер txt-файла не должен превышать 100 КБ',
        );
      }
    }

    const ext = MIME_TO_EXT[file.mimetype];
    const filename = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    const filePath = join(UPLOADS_DIR, filename);
    const publicPath = '/uploads/' + filename;

    await fs.mkdir(UPLOADS_DIR, { recursive: true });

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
        (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT)
      ) {
        await image
          .resize(MAX_WIDTH, MAX_HEIGHT, {
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
