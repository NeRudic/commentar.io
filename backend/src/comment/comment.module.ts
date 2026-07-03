import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { DBModule } from 'src/db/db.module';
import { CaptchaModule } from 'src/captcha/captcha.module';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  imports: [DBModule, CaptchaModule],
})
export class CommentModule {}
