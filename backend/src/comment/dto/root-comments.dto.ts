import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class RootCommentsDTO {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  post_id: number;
}
