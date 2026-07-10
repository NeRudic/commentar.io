import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class CommentRepliesDTO {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  parent_comment_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}
