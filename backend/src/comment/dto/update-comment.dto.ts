import { IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCommentDTO {
  @IsString()
  @MinLength(1)
  text: string;

  @IsEmail()
  user_email: string;

  @Transform(({ value }) =>
    value === undefined || value === null ? [] : (value as string[]),
  )
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  file_paths: string[];
}
