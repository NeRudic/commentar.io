import { Get, Controller, Post, Body } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { CaptchaVerifyDTO } from './dto/captcha.verify.dto';

@Controller('captcha')
export class CaptchaController {
  constructor(private readonly services: CaptchaService) {}

  @Get()
  createCaptcha() {
    return this.services.generate();
  }

  @Post('verify')
  verifyCaptcha(@Body() data: CaptchaVerifyDTO) {
    const { token, clientAnswer } = data;
    return this.services.verify(token, clientAnswer);
  }
}
