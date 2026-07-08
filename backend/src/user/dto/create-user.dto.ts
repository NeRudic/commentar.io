import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  user_name: string;

  @IsEmail()
  @IsNotEmpty()
  user_email: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  home_page?: string;
}
