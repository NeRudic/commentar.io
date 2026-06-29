import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentRowDTO } from './dto/comment-row.dto';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { CommentRepliesDTO } from './dto/comment-replies.dto';
import { RootCommentsDTO } from './dto/root-comments.dto';
import { DeleteCommentDTO } from './dto/delete-comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly services: CommentService) {}

  @Post()
  async createComment(@Body() comment_data: CreateCommentDTO) {
    const result = await this.services.createComment(comment_data);

    return result;
  }

  @Get(':post_id')
  async getRootComments(
    @Param() post_id: RootCommentsDTO,
  ): Promise<CommentRowDTO[]> {
    const comments: Array<CommentRowDTO> =
      await this.services.getRootComments(post_id);
    return comments;
  }

  @Get(':parent_id/replies')
  async getReplies(
    @Param() parent_comment_id: CommentRepliesDTO,
  ): Promise<CommentRowDTO[]> {
    const comments: Array<CommentRowDTO> =
      await this.services.getReplies(parent_comment_id);
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
