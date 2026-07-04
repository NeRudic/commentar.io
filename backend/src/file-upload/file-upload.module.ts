import { Module, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { DBModule } from '../db/db.module';
import { UPLOADS_DIR } from './file-upload.config';

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService],
  imports: [DBModule],
})
export class FileUploadModule implements OnModuleInit {
  onModuleInit() {
    fs.mkdirSync(join(process.cwd(), UPLOADS_DIR), { recursive: true });
  }
}
