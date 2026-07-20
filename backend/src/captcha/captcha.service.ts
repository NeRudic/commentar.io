import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { sign, verify as verifyToken } from 'jsonwebtoken';
import * as svgCaptcha from 'svg-captcha';
import { CaptchaVerifyDTO } from './dto/captcha.verify.dto';

export interface CaptchaResponse {
  token: string;
  svg: string;
}

export interface CaptchaVerifyResult {
  expired?: boolean;
  new_captcha?: CaptchaResponse;
  error_message?: string;
}

@Injectable()
export class CaptchaService {
  secret(): string {
    if (!process.env.CAPTCHA_SECRET)
      throw new Error('Property CAPTCHA_SECRET is not defined in .env');
    return process.env.CAPTCHA_SECRET;
  }

  generate(): CaptchaResponse {
    const captcha = svgCaptcha.create({
      size: 5,
      ignoreChars: '0o1il',
      noise: 2,
      color: true,
      background: '#f0f0f0',
      width: 180,
      height: 60,
    });

    return {
      token: sign({ answer: captcha.text }, this.secret(), {
        expiresIn: '5m',
      }),
      svg: captcha.data,
    };
  }

  verify({ captcha_token, captcha_answer }: CaptchaVerifyDTO): boolean | void {
    const payload = verifyToken(captcha_token, this.secret()) as {
      answer: string;
    };

    if (payload.answer !== captcha_answer)
      throw new Error('Неправильный ответ');

    return true;
  }
}
