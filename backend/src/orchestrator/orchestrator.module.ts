import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { DBModule } from '../db/db.module';
import { UserModule } from '../user/user.module';
import { CaptchaModule } from '../captcha/captcha.module';
import { CaptchaMiddleware } from '../common/middleware/captcha.middleware';
import { OrchestratorController } from './orchestrator.controller';
import { OrchestratorService } from './orchestrator.service';

@Module({
  imports: [DBModule, UserModule, CaptchaModule],
  controllers: [OrchestratorController],
  providers: [OrchestratorService],
})
export class OrchestratorModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CaptchaMiddleware)
      .forRoutes({ path: 'comment-and-user', method: RequestMethod.POST });
  }
}
