import { Module } from '@nestjs/common';
import { DBModule } from './db/db.module';
import { UserModule } from './user/user.module';
import { CommentModule } from './comment/comment.module';
import { CaptchaModule } from './captcha/captcha.module';
import { FileUploadModule } from './file-upload/file-upload.module';

@Module({
  imports: [
    DBModule,
    UserModule,
    CommentModule,
    CaptchaModule,
    FileUploadModule,
  ],
})
export class AppModule {}
