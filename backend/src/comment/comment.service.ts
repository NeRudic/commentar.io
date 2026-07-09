import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DB } from '../db/db.service';
import { CommentRowDTO } from './dto/comment-row.dto';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { CommentRepliesDTO } from './dto/comment-replies.dto';
import { RootCommentsDTO } from './dto/root-comments.dto';
import { DeleteCommentDTO } from './dto/delete-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly database: DB) {}

  /*
   * Create comment
   */
  async createComment(data: CreateCommentDTO): Promise<CommentRowDTO> {
    const { post_id, parent_comment_id, text, user_email, file_path } = data;

    let result: { lastID: number };

    try {
      await this.database.run(`BEGIN IMMEDIATE`);

      result = await this.database.run(
        `
      INSERT INTO comment (post_id, parent_comment_id, text, user_email, file_path)
      VALUES (?, ?, ?, ?, ?)
      `,
        [post_id, parent_comment_id, text, user_email, file_path],
      );

      if (file_path) {
        await this.database.run(
          `UPDATE file SET status = 'published' WHERE path = ?`,
          [file_path],
        );
      }

      await this.database.run(`COMMIT`);
    } catch (err) {
      await this.database.run(`ROLLBACK`);

      throw new InternalServerErrorException(
        `Failed to create comment. Error message: ${err}`,
      );
    }

    const row = await this.database.get<CommentRowDTO>(
      `
    SELECT comment.*, u.user_name, u.home_page
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

    return row;
  }

  /*
   * Get root comments
   */
  async getRootComments(
    { post_id }: RootCommentsDTO,
    limit?: string,
    offset?: string,
  ): Promise<CommentRowDTO[]> {
    const limitVal = limit ? parseInt(limit, 10) : 25;
    const offsetVal = offset ? parseInt(offset, 10) : 0;

    try {
      const comments: CommentRowDTO[] = await this.database.all(
        `
      SELECT comment.*, u.user_name, u.home_page,
        (SELECT COUNT(*) FROM comment AS c2 WHERE c2.parent_comment_id = comment.id) AS reply_count
      FROM comment
      JOIN user AS u ON comment.user_email = u.email
      WHERE post_id = ?
      AND parent_comment_id IS NULL
      ORDER BY comment.created_at DESC
      LIMIT ? OFFSET ?
      `,
        [post_id, limitVal, offsetVal],
      );
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
  async getReplies({
    parent_comment_id,
  }: CommentRepliesDTO): Promise<CommentRowDTO[]> {
    try {
      const comments: CommentRowDTO[] = await this.database.all(
        `
      SELECT comment.*, u.user_name, u.home_page,
        (SELECT COUNT(*) FROM comment AS c2 WHERE c2.parent_comment_id = comment.id) AS reply_count
      FROM comment
      JOIN user AS u ON comment.user_email = u.email
      WHERE parent_comment_id = ?
      `,
        [parent_comment_id],
      );
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
