import { Module } from '@nestjs/common';
import { DBModule } from './db/db.module';
import { UserModule } from './user/user.module';
import { CommentModule } from './comment/comment.module';
import { CaptchaModule } from './captcha/captcha.module';

@Module({
  imports: [DBModule, UserModule, CommentModule, CaptchaModule],
})
export class AppModule {}
