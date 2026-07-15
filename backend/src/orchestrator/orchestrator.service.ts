import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { FileManagerService } from '../file-manager/file-manager.service';
import { CommentRowDTO } from '../comment/dto/comment-row.dto';
import { CreateCommentWithUserDTO } from './dto/create-comment-with-user.dto';
import { parseFilePaths } from '../common/parse-file-paths';

export interface CreateCommentResult {
  comment: CommentRowDTO;
  siblings: CommentRowDTO[];
}

@Injectable()
export class OrchestratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly fileManagerService: FileManagerService,
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
      const result = await this.prisma.$transaction(async (tx) => {
        await this.userService.findOrCreate(
          { user_name, user_email, home_page: home_page ?? undefined },
          tx,
        );

        const comment = await tx.comment.create({
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

        if (filePathJson) {
          for (const fp of file_paths) {
            await this.fileManagerService.publishFile(fp, tx);
          }
        }

        return comment;
      });

      if (filePathJson) {
        for (const fp of file_paths) {
          void this.fileManagerService.removeTempFile(fp);
        }
      }

      const comment = {
        comment_id: result.id,
        post_id: result.postId,
        parent_comment_id: result.parentCommentId,
        text: result.text,
        user_email: result.userEmail,
        file_path: result.filePath,
        file_paths: parseFilePaths(result.filePath),
        created_at: result.createdAt,
        user_name: result.user.userName,
        home_page: result.user.homePage,
        reply_count: result._count.replies,
      } as unknown as CommentRowDTO;

      const siblingRows =
        parent_comment_id === null
          ? await this.prisma.comment.findMany({
              where: { postId: post_id, parentCommentId: null },
              orderBy: { createdAt: 'desc' },
              take: 25,
              include: {
                user: { select: { userName: true, homePage: true } },
                _count: { select: { replies: true } },
              },
            })
          : await this.prisma.comment.findMany({
              where: { parentCommentId: parent_comment_id },
              include: {
                user: { select: { userName: true, homePage: true } },
                _count: { select: { replies: true } },
              },
            });

      const siblings = siblingRows.map((r) => ({
        comment_id: r.id,
        post_id: r.postId,
        parent_comment_id: r.parentCommentId,
        text: r.text,
        user_email: r.userEmail,
        file_path: r.filePath,
        file_paths: parseFilePaths(r.filePath),
        created_at: r.createdAt,
        user_name: r.user.userName,
        home_page: r.user.homePage,
        reply_count: r._count.replies,
      })) as unknown as CommentRowDTO[];

      return { comment, siblings };
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;

      throw new InternalServerErrorException(
        `Failed to create comment. Error message: ${err}`,
      );
    }
  }
}
