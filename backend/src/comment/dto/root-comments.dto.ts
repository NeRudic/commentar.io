import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsIn, Max, Min } from 'class-validator';

export class RootCommentsDTO {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  post_id: number;

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

  @IsOptional()
  @IsIn(['user_name', 'email', 'created_at'])
  sort_by?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort_order?: string;
}
