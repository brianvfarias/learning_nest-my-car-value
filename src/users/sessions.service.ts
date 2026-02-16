import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { randomUUID } from 'node:crypto';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createSession(userId: number) {
    const data: Prisma.SessionCreateInput = {
      token: randomUUID(),
      expiresAt: dayjs().add(7, 'days').toDate(),
      user: {
        connect: {
          id: userId,
        },
      },
    };
    return this.prismaService.session.create({
      data,
    });
  }

  async querySession(token: string) {
    return this.prismaService.session.findFirst({
      where: {
        token,
      },
    });
  }

  async valideSession(token: string) {
    const loggedSession = await this.querySession(token);
    console.log(loggedSession);
    if (!loggedSession) return 0;
    const { expiresAt, revoked, userId } = loggedSession;
    if (revoked) return 0;
    if (dayjs(expiresAt).diff(dayjs(new Date()), 'days') >= 7) return 0;
    console.log(userId);
    return userId;
  }

  async revokeSession(token: string) {
    const loggedSession = await this.querySession(token);
    if (loggedSession)
      return this.prismaService.session.update({
        where: {
          id: loggedSession.id,
        },
        data: {
          revoked: true,
        },
      });
  }
}
