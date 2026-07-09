import { Type, Transform } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { CreateCommentDTO } from './create-comment.dto';

export class CommentRowDTO extends CreateCommentDTO {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id: number;

  @Type(() => Date)
  @IsDate()
  created_at: Date;

  @IsString()
  @MinLength(1)
  user_name: string;

  @Transform(({ value }) =>
    value === null || value === 'null' || value === undefined
      ? null
      : String(value),
  )
  @IsOptional()
  @IsString()
  @IsUrl()
  home_page: string | null;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  reply_count?: number;
}
