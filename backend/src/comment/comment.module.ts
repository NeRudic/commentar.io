import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { DBModule } from 'src/db/db.module';
import { CaptchaModule } from 'src/captcha/captcha.module';
import { CaptchaMiddleware } from '../common/middleware/captcha.middleware';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  imports: [DBModule, CaptchaModule],
})
export class CommentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CaptchaMiddleware)
      .forRoutes({ path: 'comments', method: RequestMethod.POST });
  }
}
