import { IsString, MinLength } from 'class-validator';

export class CaptchaVerifyDTO {
  @MinLength(1)
  captcha_token: string;

  @IsString()
  @MinLength(1)
  captcha_answer: string;
}
