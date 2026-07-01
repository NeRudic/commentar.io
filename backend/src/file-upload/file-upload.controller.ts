import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileUploadService } from './file-upload.service';

const ALLOWED_TYPES = ['text/plain', 'image/jpeg', 'image/gif', 'image/png'];

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly service: FileUploadService) {}

  @Post('verify')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Недопустимый тип файла'), false);
        }
      },
    }),
  )
  async verify(@UploadedFile() file: Express.Multer.File) {
    return this.service.processFile(file);
  }
}
