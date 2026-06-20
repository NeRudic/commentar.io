import { Module } from "@nestjs/common";
import { DBModule } from "../db/db.module";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  imports: [DBModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
