import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import type { CurrentUserType } from '$decorators';
import { GoogleAuthGuard } from '$modules/auth/guards';
import { FollowUserCommand, UnfollowUserCommand } from './commands';
import { ProfileController } from './profile.controller';
import { GetProfileQuery } from './queries';

import type { ProfileResponseDto } from './contracts';

describe('ProfileController', () => {
  let controller: ProfileController;
  let queryBus: QueryBus;
  let commandBus: CommandBus;

  const mockUser: CurrentUserType = { id: 1, publicId: 'test-public-id', username: 'testuser' };

  const mockProfileResponseDto: ProfileResponseDto = {
    profile: {
      username: 'testuser',
      bio: 'Test bio',
      image: 'https://example.com/image.jpg',
      following: false,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
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

    controller = module.get<ProfileController>(ProfileController);
    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return profile data', async () => {
      const username = 'testuser';
      vi.mocked(queryBus.execute).mockResolvedValue(mockProfileResponseDto);

      const result = await controller.getProfile(username);

      expect(result).toEqual(mockProfileResponseDto);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetProfileQuery(username, undefined));
    });

    it('should return profile data with current user', async () => {
      const username = 'testuser';
      vi.mocked(queryBus.execute).mockResolvedValue(mockProfileResponseDto);

      const result = await controller.getProfile(username, mockUser);

      expect(result).toEqual(mockProfileResponseDto);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetProfileQuery(username, mockUser.id));
    });
  });

  describe('followUser', () => {
    it('should follow a user', async () => {
      const username = 'testuser';
      vi.mocked(commandBus.execute).mockResolvedValue(mockProfileResponseDto);

      const result = await controller.followUser(username, mockUser);

      expect(result).toEqual(mockProfileResponseDto);
      expect(commandBus.execute).toHaveBeenCalledWith(new FollowUserCommand(username, mockUser.id));
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user', async () => {
      const username = 'testuser';
      vi.mocked(commandBus.execute).mockResolvedValue(mockProfileResponseDto);

      const result = await controller.unfollowUser(username, mockUser);

      expect(result).toEqual(mockProfileResponseDto);
      expect(commandBus.execute).toHaveBeenCalledWith(new UnfollowUserCommand(username, mockUser.id));
    });
  });
});
