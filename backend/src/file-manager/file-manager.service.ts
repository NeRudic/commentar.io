import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { DB } from '../db/db.service';
import {
  FILE_UPLOAD_CONFIG,
  MIME_TO_EXT,
  TEMP_DIR,
  UPLOADS_DIR,
} from './file-manager.config';

export interface ProcessResult {
  file_id: number;
  path: string;
}

@Injectable()
export class FileManagerService {
  constructor(private readonly database: DB) {}

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
    const tempFilePath = join(process.cwd(), TEMP_DIR, filename);
    const publicPath = '/uploads/' + filename;

    if (file.mimetype === 'text/plain') {
      await fs.writeFile(tempFilePath, file.buffer);
    } else {
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
            .resize(
              FILE_UPLOAD_CONFIG.MAX_WIDTH,
              FILE_UPLOAD_CONFIG.MAX_HEIGHT,
              {
                fit: 'inside',
                withoutEnlargement: true,
              },
            )
            .toFile(tempFilePath);
        } else {
          await image.toFile(tempFilePath);
        }
      } catch (err) {
        throw new InternalServerErrorException(
          `Ошибка обработки изображения: ${err}`,
        );
      }
    }

    try {
      const result = await this.database.run(
        `INSERT INTO file (path, status) VALUES (?, 'pending')`,
        [publicPath],
      );

      return { file_id: result.lastID, path: publicPath };
    } catch {
      await fs.unlink(tempFilePath);
      throw new InternalServerErrorException(
        'Не удалось сохранить запись о файле',
      );
    }
  }

  async publishFile(path: string): Promise<void> {
    const filename = path.replace('/uploads/', '');
    const src = join(process.cwd(), TEMP_DIR, filename);
    const dest = join(process.cwd(), UPLOADS_DIR, filename);
    await copyWithRetry(src, dest, FILE_UPLOAD_CONFIG.RETRY_LIMIT);
    await this.database.run(
      `UPDATE file SET status = 'published' WHERE path = ?`,
      [path],
    );
  }

  async removeTempFile(path: string): Promise<void> {
    const filename = path.replace('/uploads/', '');
    const tmpPath = join(process.cwd(), TEMP_DIR, filename);
    try {
      await fs.unlink(tmpPath);
    } catch {
      /* best-effort */
    }
  }
}

async function copyWithRetry(
  src: string,
  dest: string,
  retries: number,
): Promise<void> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await fs.copyFile(src, dest);
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }
}
