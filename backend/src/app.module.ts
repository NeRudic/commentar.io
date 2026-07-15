import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { CommentModule } from './comment/comment.module';
import { CaptchaModule } from './captcha/captcha.module';
import { FileManagerModule } from './file-manager/file-manager.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    CommentModule,
    CaptchaModule,
    FileManagerModule,
    OrchestratorModule,
  ],
})
export class AppModule {}
