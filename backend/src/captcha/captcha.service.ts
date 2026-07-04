import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { sign, verify as verifyToken } from 'jsonwebtoken';
import * as crypto from 'crypto';
import { CaptchaVerifyDTO } from './dto/captcha.verify.dto';

export interface CaptchaResponse {
  token: string;
  a: number;
  b: number;
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
    const [a, b] = [crypto.randomInt(1, 50), crypto.randomInt(1, 50)];

    return {
      token: sign({ answer: `${a + b}` }, this.secret(), {
        expiresIn: '5m',
      }),
      a,
      b,
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
