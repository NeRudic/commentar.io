import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { sign, verify, TokenExpiredError } from 'jsonwebtoken';
import * as crypto from 'crypto';

export interface CaptchaResponse {
  token: string;
  a: number;
  b: number;
}

export interface CaptchaVerifyResult {
  valid: boolean;
  expired?: boolean;
  newCaptcha?: CaptchaResponse;
}

@Injectable()
export class CaptchaService {
  secret(): string {
    if (!process.env.CAPTCHA_SECRET)
      throw new Error('Property CAPTCHA_SECRET is not defined in .env');
    return process.env.CAPTCHA_SECRET;
  }

  generate(): CaptchaResponse {
    const a = crypto.randomInt(1, 20);
    const b = crypto.randomInt(1, 20);
    return {
      token: sign({ answer: `${a + b}` }, this.secret(), {
        expiresIn: '5m',
      }),
      a,
      b,
    };
  }

  verify(token: string, clientAnswer: string): CaptchaVerifyResult {
    try {
      const payload = verify(token, this.secret()) as { answer: string };
      return { valid: payload.answer === clientAnswer };
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        return { valid: false, expired: true, newCaptcha: this.generate() };
      }
      return { valid: false };
    }
  }
}
