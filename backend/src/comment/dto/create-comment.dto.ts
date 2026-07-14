import { Type, Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
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
    value === undefined || value === null ? [] : value,
  )
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  file_paths: string[];
}
