import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
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
  async deleteComment(
    @Param('comment_id', ParseIntPipe) comment_id: number,
    @Query('user_email') user_email?: string,
  ): Promise<boolean> {
    const dto = new DeleteCommentDTO();
    dto.id = comment_id;
    dto.user_email = user_email;

    const deleteStatus = await this.services.deleteComment(dto);

    if (!deleteStatus)
      throw new NotFoundException(`Comment ${comment_id} not found`);

    return deleteStatus;
  }
}
