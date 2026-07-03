import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DB } from 'src/db/db.service';
import { CaptchaService } from 'src/captcha/captcha.service';
import { CommentRowDTO } from './dto/comment-row.dto';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { CommentRepliesDTO } from './dto/comment-replies.dto';
import { RootCommentsDTO } from './dto/root-comments.dto';
import { DeleteCommentDTO } from './dto/delete-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly database: DB,
    private readonly captcha: CaptchaService,
  ) {}

  /*
   * Create comment
   */
  async createComment(data: CreateCommentDTO): Promise<CommentRowDTO> {
    const {
      post_id,
      parent_comment_id,
      text,
      user_email,
      file_path,
      captcha_token,
      captcha_answer,
    } = data;

    const { valid, expired } = this.captcha.verify(
      captcha_token,
      captcha_answer,
    );
    if (!valid) {
      throw new BadRequestException(
        expired ? 'Время капчи истекло. Решите новую капчу.' : 'Неверная капча',
      );
    }

    let result: { lastID: number };

    try {
      await this.database.run(`BEGIN TRANSACTION`);

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
  async getRootComments(post_id: RootCommentsDTO): Promise<CommentRowDTO[]> {
    try {
      const comments: CommentRowDTO[] = await this.database.all(
        `
      SELECT comment.*, u.user_name, u.home_page
      FROM comment
      JOIN user AS u ON comment.user_email = u.email
      WHERE post_id = ?
      AND parent_comment_id IS NULL
      `,
        [post_id],
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
  async getReplies(
    parent_comment_id: CommentRepliesDTO,
  ): Promise<CommentRowDTO[]> {
    try {
      const comments: CommentRowDTO[] = await this.database.all(
        `
      SELECT comment.*, u.user_name, u.home_page
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
  async deleteComment(id: DeleteCommentDTO): Promise<boolean> {
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
