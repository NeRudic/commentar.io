import { Controller, Get, Param } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentRow } from '@shared/api/types';

@Controller('comments')
export class CommentController {
  constructor(private readonly services: CommentService) {}

  @Get(':post_id')
  async getRootComments(
    @Param('post_id') post_id: number,
  ): Promise<CommentRow[]> {
    const comments: Array<CommentRow> =
      await this.services.getRootComments(post_id);
    return comments;
  }
}
