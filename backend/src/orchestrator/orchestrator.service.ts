import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DB } from '../db/db.service';
import { UserService } from '../user/user.service';
import { CommentRowDTO } from '../comment/dto/comment-row.dto';
import { CreateCommentWithUserDTO } from './dto/create-comment-with-user.dto';

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
      file_path,
    } = dto;

    try {
      await this.db.run(`BEGIN IMMEDIATE`);

      await this.userService.findOrCreate({
        user_name,
        email: user_email,
        home_page: home_page ?? undefined,
      });

      const result = await this.db.run(
        `INSERT INTO comment (post_id, parent_comment_id, text, user_email, file_path) VALUES (?, ?, ?, ?, ?)`,
        [post_id, parent_comment_id, text, user_email, file_path],
      );

      if (file_path) {
        await this.db.run(
          `UPDATE file SET status = 'published' WHERE path = ?`,
          [file_path],
        );
      }

      await this.db.run(`COMMIT`);

      const comment = await this.db.get<CommentRowDTO>(
        `SELECT comment.*, u.user_name, u.home_page
         FROM comment
         JOIN user AS u ON comment.user_email = u.email
         WHERE comment.id = ?`,
        [result.lastID],
      );

      if (!comment) {
        throw new InternalServerErrorException(
          'Comment created but not found in database',
        );
      }

      const siblings: CommentRowDTO[] =
        parent_comment_id === null
          ? await this.db.all<CommentRowDTO>(
              `SELECT comment.*, u.user_name, u.home_page
             FROM comment
             JOIN user AS u ON comment.user_email = u.email
             WHERE post_id = ? AND parent_comment_id IS NULL`,
              [post_id],
            )
          : await this.db.all<CommentRowDTO>(
              `SELECT comment.*, u.user_name, u.home_page
             FROM comment
             JOIN user AS u ON comment.user_email = u.email
             WHERE parent_comment_id = ?`,
              [parent_comment_id],
            );

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
