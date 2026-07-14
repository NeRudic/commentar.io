import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DB } from '../db/db.service';
import { CommentRowDTO } from './dto/comment-row.dto';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { CommentRepliesDTO } from './dto/comment-replies.dto';
import { RootCommentsDTO } from './dto/root-comments.dto';
import { DeleteCommentDTO } from './dto/delete-comment.dto';
import { parseFilePaths } from '../common/parse-file-paths';

@Injectable()
export class CommentService {
  constructor(private readonly database: DB) {}

  /*
   * Create comment
   */
  async createComment(data: CreateCommentDTO): Promise<CommentRowDTO> {
    const { post_id, parent_comment_id, text, user_email, file_paths } = data;

    const filePathJson =
      file_paths.length > 0 ? JSON.stringify(file_paths) : null;

    let result: { lastID: number };

    try {
      await this.database.run(`BEGIN IMMEDIATE`);

      result = await this.database.run(
        `
      INSERT INTO comment (post_id, parent_comment_id, text, user_email, file_path)
      VALUES (?, ?, ?, ?, ?)
      `,
        [post_id, parent_comment_id, text, user_email, filePathJson],
      );

      if (filePathJson) {
        const placeholders = file_paths.map(() => '?').join(', ');
        await this.database.run(
          `UPDATE file SET status = 'published' WHERE path IN (${placeholders})`,
          file_paths,
        );
      }

      await this.database.run(`COMMIT`);
    } catch (err) {
      await this.database.run(`ROLLBACK`);

      throw new InternalServerErrorException(
        `Failed to create comment. Error message: ${err}`,
      );
    }

    const row = await this.database.get<Record<string, unknown>>(
      `
    SELECT comment.id AS comment_id, comment.post_id, comment.parent_comment_id, comment.text, comment.user_email, comment.file_path, comment.created_at, u.user_name, u.home_page
    FROM comment
    JOIN user AS u ON comment.user_email = u.email
    WHERE comment.id = ?
    `,
      [result.lastID],
    );

    if (!row) {
      throw new InternalServerErrorException(
        'Comment created but not found in database',
      );
    }

    return {
      ...row,
      file_paths: parseFilePaths(row.file_path),
    } as unknown as CommentRowDTO;
  }

  /*
   * Get root comments
   */
  async getRootComments(
    { post_id, sort_by, sort_order }: RootCommentsDTO,
    limit?: string,
    offset?: string,
  ): Promise<CommentRowDTO[]> {
    const limitVal = limit ? parseInt(limit, 10) : 25;
    const offsetVal = offset ? parseInt(offset, 10) : 0;

    const safeSortBy = sort_by ?? 'created_at';
    const safeSortOrder = sort_order === 'asc' ? 'ASC' : 'DESC';

    const orderClause =
      safeSortBy === 'user_name'
        ? `ORDER BY u.user_name COLLATE NOCASE ${safeSortOrder}`
        : safeSortBy === 'email'
          ? `ORDER BY u.email COLLATE NOCASE ${safeSortOrder}`
          : `ORDER BY comment.created_at ${safeSortOrder}`;

    try {
      const rows: Record<string, unknown>[] = await this.database.all(
        `
      SELECT comment.id AS comment_id, comment.post_id, comment.parent_comment_id, comment.text, comment.user_email, comment.file_path, comment.created_at, u.user_name, u.home_page,
        (SELECT COUNT(*) FROM comment AS c2 WHERE c2.parent_comment_id = comment.id) AS reply_count
      FROM comment
      JOIN user AS u ON comment.user_email = u.email
      WHERE post_id = ?
      AND parent_comment_id IS NULL
      ${orderClause}
      LIMIT ? OFFSET ?
      `,
        [post_id, limitVal, offsetVal],
      );
      const comments = rows.map((row) => ({
        ...row,
        file_paths: parseFilePaths(row.file_path),
      })) as unknown as CommentRowDTO[];
      return comments;
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to get comment. Error message: ${err}`,
      );
    }
  }

  /*
   * Get relpies comment
   */
  async getReplies(
    { parent_comment_id }: CommentRepliesDTO,
    limit?: string,
    offset?: string,
  ): Promise<CommentRowDTO[]> {
    const limitVal = limit ? parseInt(limit, 10) : 25;
    const offsetVal = offset ? parseInt(offset, 10) : 0;

    try {
      const rows: Record<string, unknown>[] = await this.database.all(
        `
      SELECT comment.id AS comment_id, comment.post_id, comment.parent_comment_id, comment.text, comment.user_email, comment.file_path, comment.created_at, u.user_name, u.home_page,
        (SELECT COUNT(*) FROM comment AS c2 WHERE c2.parent_comment_id = comment.id) AS reply_count
      FROM comment
      JOIN user AS u ON comment.user_email = u.email
      WHERE parent_comment_id = ?
      LIMIT ? OFFSET ?
      `,
        [parent_comment_id, limitVal, offsetVal],
      );
      const comments = rows.map((row) => ({
        ...row,
        file_paths: parseFilePaths(row.file_path),
      })) as unknown as CommentRowDTO[];
      return comments;
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to get comment. Error message: ${err}`,
      );
    }
  }

  /*
   * Delete comment
   */
  async deleteComment({ id }: DeleteCommentDTO): Promise<boolean> {
    try {
      const result = await this.database.run(
        `
        DELETE FROM comment WHERE id = ?
        `,
        [id],
      );

      return result.changes > 0;
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to delete comment. Error message: ${err}`,
      );
    }
  }
}
