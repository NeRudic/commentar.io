import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsPositive } from 'class-validator';

export class DeleteCommentDTO {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id: number;

  @IsOptional()
  @IsEmail()
  user_email?: string;
}
