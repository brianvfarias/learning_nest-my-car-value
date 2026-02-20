import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { Prisma } from 'src/generated/prisma/client';
import { EmailInUseError } from './errors/email-in-use.error';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    fakeUsersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      createUser: ({ email, password }: Prisma.UserCreateInput) =>
        Promise.resolve({
          id: 100,
          email,
          password,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        }),
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
      password: 'asdf',
    });
    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with an email that is in use', async () => {
    fakeUsersService.findByEmail = jest.fn().mockResolvedValue({
      id: 100,
      email: 'giberish@mail.com',
      password: 'someHahedGiberish',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    await expect(
      service.signup({
        email: 'giberish@mail.com',
        password: 'someGiberish',
      }),
    ).rejects.toThrow(EmailInUseError);
  });
});
