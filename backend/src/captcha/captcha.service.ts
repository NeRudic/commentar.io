import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

export interface CaptchaResponse {
  token: string;
  a: number;
  b: number;
}

@Injectable()
export class CaptchaService {
  constructor() {}

  secret(): string {
    return (
      process.env.CAPTCHA_SECRET ??
      (() => {
        throw new Error('Property CAPTCHA_SECRET is not defined in .env');
      })()
    );
  }

  generate(): CaptchaResponse {
    const a = crypto.randomInt(1, 20);
    const b = crypto.randomInt(1, 20);
    return {
      token: jwt.sign({ answer: `${a + b}` }, this.secret(), {
        expiresIn: '5m',
      }),
      a,
      b,
    };
  }

  verify(token: string, clientAnswer: string): { valid: boolean } {
    try {
      const payload = jwt.verify(token, this.secret()) as { answer: string };
      return { valid: payload.answer === clientAnswer };
    } catch {
      return { valid: false };
    }
  }
}
