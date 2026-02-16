import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { UserNotFoundError } from './errors/user-not-found.error';
import { UserWrongPasswordError } from './errors/user-wrong-password.error';
import { SessionsService } from './sessions.service';

const _scrypt = promisify(scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionsService,
  ) {}

  async handleCreateSession(userId: number) {
    const loggedSession = await this.sessionService.createSession(userId);
    return loggedSession;
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
    const loggedSession = await this.handleCreateSession(user.id);
    return { user, loggedSession };
  }

  async signin({ email, password }: CreateUserDto) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UserNotFoundError('User not found');
    const [salt, storedHash] = user.password.split('.');
    const hash = (await _scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new UserWrongPasswordError('User not found');
    }
    const loggedSession = await this.handleCreateSession(user.id);
    return { user, loggedSession };
  }
}
