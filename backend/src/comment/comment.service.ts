import { Injectable } from "@nestjs/common";
import { DB } from "../db/db.service";
import { CommentWithUser } from "../db/db.types";
import { PAGE_SIZE } from "./comment.config";

export interface PaginatedComments {
  comments: CommentWithUser[];
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
}

export interface CreateCommentInput {
  email: string;
  text: string;
  parent_comment_id?: number;
  file_path?: string;
}

@Injectable()
export class CommentService {
  constructor(private readonly db: DB) {}

  async create(dto: CreateCommentInput): Promise<CommentWithUser> {
    try {
      const result = await this.db.run(
        `INSERT INTO comment (text, parent_comment_id, user_email, file_path)
         VALUES (?, ?, ?, ?)`,
        [dto.text, dto.parent_comment_id ?? null, dto.email, dto.file_path ?? null],
      );

      return this.db.get<CommentWithUser>(
        `SELECT c.*, u.user_name, u.email, u.home_page
         FROM comment c
         JOIN user u ON c.user_email = u.email
         WHERE c.id = ?`,
        [result.lastID],
      );
    } catch (error) {
      console.error("CommentService.create error:", error);
      throw error;
    }
  }

  async findRoots(page: number): Promise<PaginatedComments> {
    try {
      const offset = (page - 1) * PAGE_SIZE;

      const comments = await this.db.all<CommentWithUser>(
        `SELECT c.*, u.user_name, u.email, u.home_page
         FROM comment c
         JOIN user u ON c.user_email = u.email
         WHERE c.parent_comment_id IS NULL
         ORDER BY c.created_at DESC
         LIMIT ? OFFSET ?`,
        [PAGE_SIZE, offset],
      );

      const { total } = await this.db.get<{ total: number }>(
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
      console.error("CommentService.findRoots error:", error);
      throw error;
    }
  }

  async findReplies(commentId: number): Promise<CommentWithUser[]> {
    try {
      return this.db.all<CommentWithUser>(
        `SELECT c.*, u.user_name, u.email, u.home_page
         FROM comment c
         JOIN user u ON c.user_email = u.email
         WHERE c.parent_comment_id = ?
         ORDER BY c.created_at ASC`,
        [commentId],
      );
    } catch (error) {
      console.error("CommentService.findReplies error:", error);
      throw error;
    }
  }
}
