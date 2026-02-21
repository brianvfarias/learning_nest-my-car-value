import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { Prisma } from 'src/generated/prisma/client';
import { EmailInUseError } from './errors/email-in-use.error';
import { UserNotFoundError } from './errors/user-not-found.error';
import { UserWrongPasswordError } from './errors/user-wrong-password.error';
import { UserModel, ReportModel } from 'src/generated/prisma/models';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users = [] as UserModel[];
    fakeUsersService = {
      findByEmail: (email) => {
        const user = users.find((user) => user.email === email);
        if (!user) return Promise.resolve(null);
        return Promise.resolve(user);
      },
      createUser: ({ email, password }: Prisma.UserCreateInput) => {
        const newUser = {
          id: Math.floor(Math.random() * 999),
          email,
          password,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };
        users.push(newUser);
        return Promise.resolve(newUser);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup({
      email: 'giberish@mail.com',
      password: 'giberish',
    });
    const [salt, hash] = user.password.split('.');
    expect(user.password).not.toEqual('giberish');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with an email that is in use', async () => {
    await service.signup({
      email: 'giberish@mail.com',
      password: 'someGiberish',
    });

    await expect(
      service.signup({
        email: 'giberish@mail.com',
        password: 'someGiberish',
      }),
    ).rejects.toThrow(EmailInUseError);
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(
      service.signin({ email: 'giberish@mail.com', password: 'giberish' }),
    ).rejects.toThrow(UserNotFoundError);
  });

  it('signin throws if an invalid password is provided', async () => {
    await service.signup({ email: 'giberish@mail.com', password: 'giberish' });

    await expect(
      service.signin({ email: 'giberish@mail.com', password: 'giberish2' }),
    ).rejects.toThrow(UserWrongPasswordError);
  });

  it('signin returns a user if correct password is provided', async () => {
    await service.signup({
      email: 'giberish@mail.com',
      password: 'giberish',
    });
    const user = await service.signin({
      email: 'giberish@mail.com',
      password: 'giberish',
    });
    expect(user).toBeDefined();
  });
});
