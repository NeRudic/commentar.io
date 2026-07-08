import { Injectable } from '@nestjs/common';
import { DB } from '../db/db.service';
import { CreateUserDTO } from './dto/create-user.dto';
import type { UserRow } from './user.types';

@Injectable()
export class UserService {
  constructor(private readonly db: DB) {}

  async findOrCreate(dto: CreateUserDTO): Promise<UserRow> {
    try {
      const existing = await this.db.get<UserRow>(
        'SELECT * FROM user WHERE email = ?',
        [dto.user_email],
      );

      if (existing) return existing;

      const result = await this.db.run(
        'INSERT INTO user (user_name, email, home_page) VALUES (?, ?, ?)',
        [dto.user_name, dto.user_email, dto.home_page ?? null],
      );

      return this.db.get<UserRow>('SELECT * FROM user WHERE id = ?', [
        result.lastID,
      ]);
    } catch (error) {
      console.error('UserService.findOrCreate error:', error);
      throw error;
    }
  }
}
