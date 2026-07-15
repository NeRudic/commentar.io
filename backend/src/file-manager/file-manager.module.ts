import { Module, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { FileManagerController } from './file-manager.controller';
import { FileManagerService } from './file-manager.service';
import { FileCleanupService } from './file-manager.cleanup';
import { UPLOADS_DIR, TEMP_DIR } from './file-manager.config';

@Module({
  controllers: [FileManagerController],
  providers: [FileManagerService, FileCleanupService],
  exports: [FileManagerService],
})
export class FileManagerModule implements OnModuleInit {
  onModuleInit() {
    fs.mkdirSync(join(process.cwd(), UPLOADS_DIR), { recursive: true });
    fs.mkdirSync(join(process.cwd(), TEMP_DIR), { recursive: true });
  }
}
