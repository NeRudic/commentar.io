import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { CaptchaModule } from '../captcha/captcha.module';
import { FileManagerModule } from '../file-manager/file-manager.module';
import { CaptchaMiddleware } from '../common/middleware/captcha.middleware';
import { OrchestratorController } from './orchestrator.controller';
import { OrchestratorService } from './orchestrator.service';

@Module({
  imports: [UserModule, CaptchaModule, FileManagerModule],
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
