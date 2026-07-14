import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileManagerService } from './file-manager.service';
import { FILE_UPLOAD_CONFIG } from './file-manager.config';

@Controller('file-upload')
export class FileManagerController {
  constructor(private readonly service: FileManagerService) {}

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
