import { IsOptional, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class CommentQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
