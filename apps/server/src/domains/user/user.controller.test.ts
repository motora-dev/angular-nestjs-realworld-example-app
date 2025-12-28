import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import type { CurrentUserType } from '$decorators';
import { GoogleAuthGuard } from '$modules/auth/guards';
import { UpdateUserCommand } from './commands';
import { GetCurrentUserQuery } from './queries';
import { UserController } from './user.controller';

import type { UpdateUserRequestDto, UserResponseDto } from './contracts';

describe('UserController', () => {
  let controller: UserController;
  let queryBus: QueryBus;
  let commandBus: CommandBus;

  const mockUser: CurrentUserType = { id: 1, publicId: 'test-public-id', username: 'testuser' };

  const mockUserResponseDto: UserResponseDto = {
    user: {
      email: 'test@example.com',
      username: 'testuser',
      bio: 'Test bio',
      image: 'https://example.com/image.jpg',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: QueryBus,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: CommandBus,
          useValue: {
            execute: vi.fn(),
          },
        },
      ],
    })
      .overrideGuard(GoogleAuthGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      vi.mocked(queryBus.execute).mockResolvedValue(mockUserResponseDto);

      const result = await controller.getCurrentUser(mockUser);

      expect(result).toEqual(mockUserResponseDto);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetCurrentUserQuery(mockUser.id));
    });
  });

  describe('updateUser', () => {
    it('should update user data', async () => {
      const request: UpdateUserRequestDto = {
        user: {
          email: 'newemail@example.com',
          username: 'newusername',
        },
      };
      vi.mocked(commandBus.execute).mockResolvedValue(mockUserResponseDto);

      const result = await controller.updateUser(mockUser, request);

      expect(result).toEqual(mockUserResponseDto);
      expect(commandBus.execute).toHaveBeenCalledWith(new UpdateUserCommand(mockUser.id, request));
    });
  });
});
