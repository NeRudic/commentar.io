import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import type { UserRow } from './user.types';
import type { TxClient } from '../prisma/prisma.types';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(dto: CreateUserDTO, tx?: TxClient): Promise<UserRow> {
    const client = tx ?? this.prisma;

    const user = await client.user.upsert({
      where: { email: dto.user_email },
      create: {
        userName: dto.user_name,
        email: dto.user_email,
        homePage: dto.home_page ?? null,
      },
      update: {},
    });

    return {
      id: user.id,
      user_name: user.userName,
      email: user.email,
      home_page: user.homePage,
    };
  }
}
