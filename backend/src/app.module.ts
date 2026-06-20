import { Module } from "@nestjs/common";
import { DBModule } from "./db/db.module";
import { UserModule } from "./user/user.module";
import { CommentModule } from "./comment/comment.module";

@Module({
  imports: [DBModule, UserModule, CommentModule],
})
export class AppModule {}
