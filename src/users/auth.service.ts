import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { UserNotFoundError } from './errors/user-not-found.error';
import { UserWrongPasswordError } from './errors/user-wrong-password.error';
import { JwtService } from '@nestjs/jwt';

const _scrypt = promisify(scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signToken(userId: number) {
    try {
      const payload = { sub: userId };
      const access_token = await this.jwtService.signAsync(payload);
      return {
        access_token,
      };
    } catch (e) {}
  }

  async signup({ email, password }: CreateUserDto) {
    const checkUser = await this.usersService.findByEmail(email);
    if (checkUser) throw new Error('Email in use');
    const salt = randomBytes(8).toString('hex');

    const hash = (await _scrypt(password, salt, 32)) as Buffer;

    const hashedPassword = salt + '.' + hash.toString('hex');
    const user = await this.usersService.createUser({
      email,
      password: hashedPassword,
    });
    const { id } = user;
    const token = await this.signToken(id);
    return {
      token,
      user,
    };
  }

  async signin({ email, password }: CreateUserDto) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError('User not found');
    }
    const [salt, storedHash] = user.password.split('.');
    const hash = (await _scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new UserWrongPasswordError('User not found');
    }
    const token = await this.signToken(user.id);
    return { token, user };
  }
}
