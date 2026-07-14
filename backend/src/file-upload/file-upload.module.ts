import { Module, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { FileCleanupService } from './file-upload.cleanup';
import { DBModule } from '../db/db.module';
import { UPLOADS_DIR, TEMP_DIR } from './file-upload.config';

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService, FileCleanupService],
  imports: [DBModule],
})
export class FileUploadModule implements OnModuleInit {
  onModuleInit() {
    fs.mkdirSync(join(process.cwd(), UPLOADS_DIR), { recursive: true });
    fs.mkdirSync(join(process.cwd(), TEMP_DIR), { recursive: true });
  }
}
