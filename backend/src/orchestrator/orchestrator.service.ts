import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { DB } from '../db/db.service';
import { UserService } from '../user/user.service';
import { CommentRowDTO } from '../comment/dto/comment-row.dto';
import { CreateCommentWithUserDTO } from './dto/create-comment-with-user.dto';
import { parseFilePaths } from '../common/parse-file-paths';
import {
  UPLOADS_DIR,
  TEMP_DIR,
  FILE_UPLOAD_CONFIG,
} from '../file-upload/file-upload.config';

export interface CreateCommentResult {
  comment: CommentRowDTO;
  siblings: CommentRowDTO[];
}

@Injectable()
export class OrchestratorService {
  constructor(
    private readonly db: DB,
    private readonly userService: UserService,
  ) {}

  async createCommentWithUser(
    dto: CreateCommentWithUserDTO,
  ): Promise<CreateCommentResult> {
    const {
      user_name,
      home_page,
      post_id,
      parent_comment_id,
      text,
      user_email,
      file_paths,
    } = dto;

    const filePathJson =
      file_paths.length > 0 ? JSON.stringify(file_paths) : null;

    try {
      await this.db.run(`BEGIN IMMEDIATE`);

      await this.userService.findOrCreate({
        user_name,
        user_email,
        home_page: home_page ?? undefined,
      });

      const result = await this.db.run(
        `INSERT INTO comment (post_id, parent_comment_id, text, user_email, file_path) VALUES (?, ?, ?, ?, ?)`,
        [post_id, parent_comment_id, text, user_email, filePathJson],
      );

      if (filePathJson) {
        for (const fp of file_paths) {
          const filename = fp.replace('/uploads/', '');
          const src = join(process.cwd(), TEMP_DIR, filename);
          const dest = join(process.cwd(), UPLOADS_DIR, filename);
          await copyWithRetry(src, dest, FILE_UPLOAD_CONFIG.RETRY_LIMIT);
        }

        const placeholders = file_paths.map(() => '?').join(', ');
        await this.db.run(
          `UPDATE file SET status = 'published' WHERE path IN (${placeholders})`,
          file_paths,
        );
      }

      await this.db.run(`COMMIT`);

      if (filePathJson) {
        for (const fp of file_paths) {
          const filename = fp.replace('/uploads/', '');
          const tmpPath = join(process.cwd(), TEMP_DIR, filename);
          try {
            await fs.unlink(tmpPath);
          } catch {
            /* best-effort — cleanup job will collect leftovers */
          }
        }
      }

      const row = await this.db.get<Record<string, unknown>>(
        `SELECT comment.id AS comment_id, comment.post_id, comment.parent_comment_id, comment.text, comment.user_email, comment.file_path, comment.created_at, u.user_name, u.home_page,
          (SELECT COUNT(*) FROM comment AS c2 WHERE c2.parent_comment_id = comment.id) AS reply_count
         FROM comment
         JOIN user AS u ON comment.user_email = u.email
         WHERE comment.id = ?`,
        [result.lastID],
      );

      if (!row) {
        throw new InternalServerErrorException(
          'Comment created but not found in database',
        );
      }

      const comment = {
        ...row,
        file_paths: parseFilePaths(row.file_path),
      } as unknown as CommentRowDTO;

      const siblingRows: Record<string, unknown>[] =
        parent_comment_id === null
          ? await this.db.all(
              `SELECT comment.id AS comment_id, comment.post_id, comment.parent_comment_id, comment.text, comment.user_email, comment.file_path, comment.created_at, u.user_name, u.home_page,
                (SELECT COUNT(*) FROM comment AS c2 WHERE c2.parent_comment_id = comment.id) AS reply_count
             FROM comment
             JOIN user AS u ON comment.user_email = u.email
             WHERE post_id = ? AND parent_comment_id IS NULL
             ORDER BY comment.created_at DESC
             LIMIT 25`,
              [post_id],
            )
          : await this.db.all(
              `SELECT comment.id AS comment_id, comment.post_id, comment.parent_comment_id, comment.text, comment.user_email, comment.file_path, comment.created_at, u.user_name, u.home_page,
                (SELECT COUNT(*) FROM comment AS c2 WHERE c2.parent_comment_id = comment.id) AS reply_count
             FROM comment
             JOIN user AS u ON comment.user_email = u.email
             WHERE parent_comment_id = ?`,
              [parent_comment_id],
            );

      const siblings = siblingRows.map((r) => ({
        ...r,
        file_paths: parseFilePaths(r.file_path),
      })) as unknown as CommentRowDTO[];

      return { comment, siblings };
    } catch (err) {
      await this.db.run(`ROLLBACK`);

      if (err instanceof InternalServerErrorException) throw err;

      throw new InternalServerErrorException(
        `Failed to create comment. Error message: ${err}`,
      );
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
