import { Type, Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateCommentDTO {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  post_id: number;

  @Transform(({ value }) =>
    value === null || value === 'null' || value === undefined
      ? null
      : Number(value),
  )
  @IsOptional()
  @IsInt()
  @IsPositive()
  parent_comment_id: number | null;

  @IsString()
  @MinLength(1)
  text: string;

  @IsEmail()
  user_email: string;

  @Transform(({ value }) =>
    value === null || value === 'null' || value === undefined
      ? null
      : String(value),
  )
  @IsOptional()
  @IsString()
  @IsUrl()
  file_path: string | null;
}
