import { Injectable } from "@nestjs/common";
import { DB } from "../db/db.service";

const PAGE_SIZE = 25;

@Injectable()
export class CommentService {
  constructor(private readonly db: DB) {}

  async create(dto: { email: string; text: string; parent_comment_id?: number; file_path?: string }) {
    try {
      const result = await this.db.run(
        `INSERT INTO comment (text, parent_comment_id, user_email, file_path)
         VALUES (?, ?, ?, ?)`,
        [dto.text, dto.parent_comment_id ?? null, dto.email, dto.file_path ?? null],
      );

      return this.db.get(
        `SELECT c.*, u.user_name, u.email, u.home_page
         FROM comment c
         JOIN user u ON c.user_email = u.email
         WHERE c.id = ?`,
        [result.lastID],
      );
    } catch (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }
  }

  async findRoots(page: number) {
    try {
      const offset = (page - 1) * PAGE_SIZE;

      const comments = await this.db.all(
        `SELECT c.*, u.user_name, u.email, u.home_page
         FROM comment c
         JOIN user u ON c.user_email = u.email
         WHERE c.parent_comment_id IS NULL
         ORDER BY c.created_at DESC
         LIMIT ? OFFSET ?`,
        [PAGE_SIZE, offset],
      );

      const { total } = await this.db.get(
        "SELECT COUNT(*) as total FROM comment WHERE parent_comment_id IS NULL",
      );

      return {
        comments,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
        total,
      };
    } catch (error) {
      throw new Error(`Failed to find root comments: ${error.message}`);
    }
  }

  async findReplies(commentId: number) {
    try {
      return this.db.all(
        `SELECT c.*, u.user_name, u.email, u.home_page
         FROM comment c
         JOIN user u ON c.user_email = u.email
         WHERE c.parent_comment_id = ?
         ORDER BY c.created_at ASC`,
        [commentId],
      );
    } catch (error) {
      throw new Error(`Failed to find replies: ${error.message}`);
    }
  }
}
