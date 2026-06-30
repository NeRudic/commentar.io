import { IsString, MinLength } from 'class-validator';

export class CaptchaVerifyDTO {
  @IsString()
  token: string;

  @IsString()
  @MinLength(1)
  clientAnswer: string;
}
