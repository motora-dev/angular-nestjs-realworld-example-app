import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ProfileService } from '$domains/profile/services/profile.service';
import { UnfollowUserCommand } from './unfollow-user.command';
import { UnfollowUserHandler } from './unfollow-user.handler';

describe('UnfollowUserHandler', () => {
  let handler: UnfollowUserHandler;
  let mockService: any;

  const mockProfileResponseDto = {
    profile: {
      username: 'testuser',
      bio: 'Test bio',
      image: 'https://example.com/image.jpg',
      following: false,
    },
  };

  beforeEach(async () => {
    mockService = {
      unfollowUser: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnfollowUserHandler,
        {
          provide: ProfileService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<UnfollowUserHandler>(UnfollowUserHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle UnfollowUserCommand', async () => {
    const username = 'testuser';
    const currentUserId = 1;
    const command = new UnfollowUserCommand(username, currentUserId);

    mockService.unfollowUser.mockResolvedValue(mockProfileResponseDto);

    const result = await handler.execute(command);

    expect(result).toEqual(mockProfileResponseDto);
    expect(mockService.unfollowUser).toHaveBeenCalledWith(username, currentUserId);
  });
});
