import { Module } from '@nestjs/common';
import { DBModule } from './db/db.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [DBModule, UserModule],
})
export class AppModule {}
