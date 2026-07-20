import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CommentRowDTO } from './dto/comment-row.dto';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { UpdateCommentDTO } from './dto/update-comment.dto';
import { CommentRepliesDTO } from './dto/comment-replies.dto';
import { RootCommentsDTO } from './dto/root-comments.dto';
import { DeleteCommentDTO } from './dto/delete-comment.dto';
import { parseFilePaths } from '../common/parse-file-paths';
import type { TxClient } from '../prisma/prisma.types';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async createComment(
    data: CreateCommentDTO,
    tx?: TxClient,
  ): Promise<CommentRowDTO> {
    const client = tx ?? this.prisma;
    const { post_id, parent_comment_id, text, user_email, file_paths } = data;

    const filePathJson =
      file_paths.length > 0 ? JSON.stringify(file_paths) : null;

    const comment = await client.comment.create({
      data: {
        postId: post_id,
        parentCommentId: parent_comment_id,
        text,
        userEmail: user_email,
        filePath: filePathJson,
      },
      include: {
        user: { select: { userName: true, homePage: true } },
        _count: { select: { replies: true } },
      },
    });

    return {
      comment_id: comment.id,
      post_id: comment.postId,
      parent_comment_id: comment.parentCommentId,
      text: comment.text,
      user_email: comment.userEmail,
      file_path: comment.filePath,
      file_paths: parseFilePaths(comment.filePath),
      created_at: comment.createdAt,
      user_name: comment.user.userName,
      home_page: comment.user.homePage,
      reply_count: comment._count.replies,
    } as unknown as CommentRowDTO;
  }

  async getRootComments(
    { post_id, sort_by, sort_order }: RootCommentsDTO,
    limit?: string,
    offset?: string,
  ): Promise<CommentRowDTO[]> {
    const limitVal = limit ? parseInt(limit, 10) : 25;
    const offsetVal = offset ? parseInt(offset, 10) : 0;

    const safeSortBy = sort_by ?? 'created_at';
    const safeSortOrder = sort_order === 'asc' ? 'asc' : 'desc';

    const orderByMap: Record<string, Prisma.CommentOrderByWithRelationInput> = {
      user_name: { user: { userName: safeSortOrder } },
      email: { user: { email: safeSortOrder } },
      created_at: { createdAt: safeSortOrder },
    };
    const orderBy = orderByMap[safeSortBy] ?? orderByMap.created_at;

    try {
      const rows = await this.prisma.comment.findMany({
        where: { postId: post_id, parentCommentId: null },
        orderBy,
        skip: offsetVal,
        take: limitVal,
        include: {
          user: { select: { userName: true, homePage: true } },
          _count: { select: { replies: true } },
        },
      });

      return rows.map((row) => ({
        comment_id: row.id,
        post_id: row.postId,
        parent_comment_id: row.parentCommentId,
        text: row.text,
        user_email: row.userEmail,
        file_path: row.filePath,
        file_paths: parseFilePaths(row.filePath),
        created_at: row.createdAt,
        user_name: row.user.userName,
        home_page: row.user.homePage,
        reply_count: row._count.replies,
      }));
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to get comment. Error message: ${err}`,
      );
    }
  }

  async getReplies(
    { parent_comment_id }: CommentRepliesDTO,
    limit?: string,
    offset?: string,
  ): Promise<CommentRowDTO[]> {
    const limitVal = limit ? parseInt(limit, 10) : 25;
    const offsetVal = offset ? parseInt(offset, 10) : 0;

    try {
      const rows = await this.prisma.comment.findMany({
        where: { parentCommentId: parent_comment_id },
        skip: offsetVal,
        take: limitVal,
        include: {
          user: { select: { userName: true, homePage: true } },
          _count: { select: { replies: true } },
        },
      });

      return rows.map((row) => ({
        comment_id: row.id,
        post_id: row.postId,
        parent_comment_id: row.parentCommentId,
        text: row.text,
        user_email: row.userEmail,
        file_path: row.filePath,
        file_paths: parseFilePaths(row.filePath),
        created_at: row.createdAt,
        user_name: row.user.userName,
        home_page: row.user.homePage,
        reply_count: row._count.replies,
      }));
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to get comment. Error message: ${err}`,
      );
    }
  }

  async updateComment(
    commentId: number,
    data: UpdateCommentDTO,
    tx?: TxClient,
  ): Promise<CommentRowDTO> {
    const client = tx ?? this.prisma;

    const comment = await client.comment.findUnique({
      where: { id: commentId },
      include: {
        user: { select: { userName: true, homePage: true } },
        _count: { select: { replies: true } },
      },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userEmail !== data.user_email)
      throw new ForbiddenException('Email does not match comment owner');

    const filePathJson =
      data.file_paths.length > 0 ? JSON.stringify(data.file_paths) : null;

    const updated = await client.comment.update({
      where: { id: commentId },
      data: {
        text: data.text,
        filePath: filePathJson,
      },
      include: {
        user: { select: { userName: true, homePage: true } },
        _count: { select: { replies: true } },
      },
    });

    return {
      comment_id: updated.id,
      post_id: updated.postId,
      parent_comment_id: updated.parentCommentId,
      text: updated.text,
      user_email: updated.userEmail,
      file_path: updated.filePath,
      file_paths: parseFilePaths(updated.filePath),
      created_at: updated.createdAt,
      user_name: updated.user.userName,
      home_page: updated.user.homePage,
      reply_count: updated._count.replies,
    } as unknown as CommentRowDTO;
  }

  async deleteComment(
    id: number,
    user_email?: string,
  ): Promise<boolean> {
    if (user_email) {
      const comment = await this.prisma.comment.findUnique({
        where: { id },
        select: { userEmail: true },
      });
      if (!comment) return false;
      if (comment.userEmail !== user_email)
        throw new ForbiddenException('Email does not match comment owner');
    }

    try {
      await this.prisma.comment.delete({ where: { id } });
      return true;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        return false;
      }
      throw new InternalServerErrorException(
        `Failed to delete comment. Error message: ${err}`,
      );
    }
  }
}
