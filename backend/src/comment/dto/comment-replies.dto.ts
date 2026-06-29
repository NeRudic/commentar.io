import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class CommentRepliesDTO {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  parent_comment_id: number;
}
