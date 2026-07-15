import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import {
  TEMP_DIR,
  UPLOADS_DIR,
  FILE_UPLOAD_CONFIG,
} from './file-manager.config';

const INTERVAL_MS = FILE_UPLOAD_CONFIG.CLEANUP_INTERVAL_MS;

@Injectable()
export class FileCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FileCleanupService.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.timer = setInterval(() => {
      void this.cleanup();
    }, INTERVAL_MS);
    void this.cleanup();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async cleanup(): Promise<void> {
    try {
      await this.cleanupTempFiles();
      await this.cleanupOrphanedUploads();
      await this.cleanupOrphanedRows();
    } catch (err) {
      this.logger.error(`Cleanup cycle failed: ${err}`);
    }
  }

  private async cleanupTempFiles(): Promise<void> {
    const tmpDir = join(process.cwd(), TEMP_DIR);
    const now = Date.now();

    try {
      const names = await fs.readdir(tmpDir);
      for (const name of names) {
        const filePath = join(tmpDir, name);
        try {
          const stat = await fs.stat(filePath);
          if (now - stat.mtimeMs > FILE_UPLOAD_CONFIG.CLEANUP_THRESHOLD_MS) {
            await fs.unlink(filePath);
            this.logger.log(`Cleaned up .tmp/${name}`);
          }
        } catch {
          /* skip individual file errors */
        }
      }
    } catch {
      /* .tmp dir might not exist yet */
    }
  }

  private async cleanupOrphanedUploads(): Promise<void> {
    const threshold = new Date(
      Date.now() - FILE_UPLOAD_CONFIG.CLEANUP_THRESHOLD_MS,
    );

    const rows = await this.prisma.file.findMany({
      where: {
        status: 'pending',
        createdAt: { lt: threshold },
      },
      select: { path: true },
    });

    const uploadsDir = join(process.cwd(), UPLOADS_DIR);
    for (const row of rows) {
      const filename = row.path.replace('/uploads/', '');
      const filePath = join(uploadsDir, filename);
      try {
        await fs.unlink(filePath);
        this.logger.log(`Cleaned up orphaned ${row.path}`);
      } catch {
        /* file might not exist */
      }
    }
  }

  private async cleanupOrphanedRows(): Promise<void> {
    const threshold = new Date(
      Date.now() - FILE_UPLOAD_CONFIG.CLEANUP_THRESHOLD_MS,
    );

    const result = await this.prisma.file.deleteMany({
      where: {
        status: 'pending',
        createdAt: { lt: threshold },
      },
    });

    if (result.count > 0) {
      this.logger.log(`Removed ${result.count} orphaned file rows`);
    }
  }
}
