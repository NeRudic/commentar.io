import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentRowDTO } from './dto/comment-row.dto';
import { CommentRepliesDTO } from './dto/comment-replies.dto';
import { RootCommentsDTO } from './dto/root-comments.dto';
import { DeleteCommentDTO } from './dto/delete-comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly services: CommentService) {}

  @Get(':post_id')
  async getRootComments(
    @Param() params: RootCommentsDTO,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sort_by') sort_by?: string,
    @Query('sort_order') sort_order?: string,
  ): Promise<CommentRowDTO[]> {
    const comments: Array<CommentRowDTO> = await this.services.getRootComments(
      { ...params, sort_by, sort_order },
      limit,
      offset,
    );
    return comments;
  }

  @Get(':parent_comment_id/replies')
  async getReplies(
    @Param() params: CommentRepliesDTO,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<CommentRowDTO[]> {
    const comments: Array<CommentRowDTO> = await this.services.getReplies(
      params,
      limit,
      offset,
    );
    return comments;
  }

  @Delete(':comment_id')
  async deleteComment(@Param() id: DeleteCommentDTO): Promise<boolean> {
    const deleteStatus: boolean = await this.services.deleteComment(id);

    if (!deleteStatus)
      throw new NotFoundException(`Comment ${id.id} not found`);

    return deleteStatus;
  }
}
