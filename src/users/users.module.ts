import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard/auth.guard';
import { SessionsService } from './sessions.service';

@Module({
  providers: [UsersService, AuthService, SessionsService],
  controllers: [UsersController],
  exports: [UsersService],
  imports: [PrismaModule],
})
export class UsersModule {}
