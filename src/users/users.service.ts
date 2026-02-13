import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        reports: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
      },
      include: {
        reports: true,
      },
    });
  }

  async updateUser(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ) {
    try {
      return await this.prisma.user.update({
        where,
        data,
        select: {
          id: true,
          email: true,
        },
      });
    } catch (e) {
      throw new Error();
    }
  }
}
