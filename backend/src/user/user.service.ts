import { Injectable } from "@nestjs/common";
import { DB } from "../db/db.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserRow } from "../db/db.types";

@Injectable()
export class UserService {
  constructor(private readonly db: DB) {}

  async findOrCreate(dto: CreateUserDto): Promise<UserRow> {
    try {
      const existing = await this.db.get<UserRow>(
        "SELECT * FROM user WHERE email = ?",
        [dto.email],
      );

      if (existing) return existing;

      const result = await this.db.run(
        "INSERT INTO user (user_name, email, home_page) VALUES (?, ?, ?)",
        [dto.user_name, dto.email, dto.home_page ?? null],
      );

      return this.db.get<UserRow>(
        "SELECT * FROM user WHERE id = ?",
        [result.lastID],
      );
    } catch (error) {
      console.error("UserService.findOrCreate error:", error);
      throw error;
    }
  }
}
