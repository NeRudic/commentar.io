import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { CaptchaService } from '../../captcha/captcha.service';
import { CaptchaVerifyDTO } from '../../captcha/dto/captcha.verify.dto';
import { CreateCommentDTO } from '../../comment/dto/create-comment.dto';

@Injectable()
export class CaptchaMiddleware implements NestMiddleware {
  constructor(private readonly captcha: CaptchaService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const { captcha_token, captcha_answer, ...comment_data } =
      req.body as CaptchaVerifyDTO & CreateCommentDTO;

    if (!captcha_token || !captcha_answer)
      throw new BadRequestException('Captcha token and answer are required');

    try {
      this.captcha.verify({ captcha_token, captcha_answer });

      req.body = comment_data;
      next();
    } catch (err) {
      throw new BadRequestException({
        captcha_error: {
          expired: err instanceof TokenExpiredError ? true : false,
          new_captcha: this.captcha.generate(),
          error_message: err instanceof Error ? err.message : String(err),
        },
      });
    }
  }
}
