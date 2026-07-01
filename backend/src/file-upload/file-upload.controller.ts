import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileUploadService } from './file-upload.service';
import { FILE_UPLOAD_CONFIG } from './file-upload.config';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly service: FileUploadService) {}

  @Post('verify')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: FILE_UPLOAD_CONFIG.MAX_FILE_SIZE },
    }),
  )
  async verify(@UploadedFile() file: Express.Multer.File) {
    return this.service.processFile(file);
  }
}
