import { Injectable } from '@nestjs/common';
import { DB } from 'src/db/db.service';
import { CommentRow } from '@shared/api/types';

@Injectable()
export class CommentService {
  constructor(private readonly database: DB) {}

  async getRootComments(post_id: number): Promise<CommentRow[]> {
    const result: Array<CommentRow> = await this.database.all(
      `SELECT * FROM comment
      WHERE post_id = ?
      AND parent_comment_id IS NULL`,
      [post_id],
    );
    return result;
  }
}
