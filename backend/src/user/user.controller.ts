import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { SanitizePipe } from "../common/sanitize.pipe";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async findOrCreate(@Body(new SanitizePipe(["user_name", "home_page"])) dto: CreateUserDto) {
    return this.userService.findOrCreate(dto);
  }
}
