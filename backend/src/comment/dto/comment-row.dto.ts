import { Type } from 'class-transformer';
import { IsDate, IsInt, IsPositive } from 'class-validator';
import { CreateCommentDTO } from './create-comment.dto';

export class CommentRowDTO extends CreateCommentDTO {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id: number;

  @Type(() => Date)
  @IsDate()
  created_at: Date;
}
