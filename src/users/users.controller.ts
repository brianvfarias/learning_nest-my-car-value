import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Session,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { FindUserByEmailDto } from './dtos/find-user-by-email.dot';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { UserNotFoundError } from './errors/user-not-found.error';
import { UserWrongPasswordError } from './errors/user-wrong-password.error';
import { Prisma } from 'src/generated/prisma/client';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from 'src/guard/auth.guard';

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    try {
      const user = await this.authService.signup(body);
      session.userId = user.id;
      return user;
    } catch (e) {
      if (e.message === 'Email in use')
        throw new ForbiddenException('Email in use');
    }
  }

  @Post('signin')
  async singinUser(@Body() body: CreateUserDto, @Session() session: any) {
    try {
      const { id } = await this.authService.signin(body);
      session.userId = id;
      return { id };
    } catch (e) {
      if (e instanceof UserNotFoundError) {
        throw new NotFoundException('Email not found');
      }
      if (e instanceof UserWrongPasswordError)
        throw new UnauthorizedException(
          'Could not authorize the email or password provided!',
        );
    }
  }

  // @Get('whoami')
  // async whoAmI(@Session() session: any) {
  //   if (!session.userId) throw new UnauthorizedException();
  //   return this.userService.findById(session.userId);
  // }

  @Get('whoami')
  @UseGuards(AuthGuard)
  async WhoAmI(@CurrentUser() user: Prisma.UserSelect) {
    return user;
  }

  @Post('signout')
  signOut(@Session() session: any) {
    session.userId = null;
  }

  @Get(':id')
  async findUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @Get()
  async findUserByEmail(@Query() query: FindUserByEmailDto) {
    const { email } = query;
    return this.userService.findByEmail(email);
  }

  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    try {
      const where = { id, deletedAt: null };
      const updated = await this.userService.updateUser(where, body);
      return updated;
    } catch (e) {
      throw new NotFoundException('User not found');
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    try {
      const where = { id, deletedAt: null };
      const deletedAt = new Date();
      const deleted = await this.userService.updateUser(where, { deletedAt });
      return deleted;
    } catch (e) {
      throw new NotFoundException('User not found!');
    }
  }
}
