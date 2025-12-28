import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ProfileService } from '$domains/profile/services/profile.service';
import { FollowUserCommand } from './follow-user.command';
import { FollowUserHandler } from './follow-user.handler';

describe('FollowUserHandler', () => {
  let handler: FollowUserHandler;
  let mockService: any;

  const mockProfileResponseDto = {
    profile: {
      username: 'testuser',
      bio: 'Test bio',
      image: 'https://example.com/image.jpg',
      following: true,
    },
  };

  beforeEach(async () => {
    mockService = {
      followUser: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowUserHandler,
        {
          provide: ProfileService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<FollowUserHandler>(FollowUserHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle FollowUserCommand', async () => {
    const username = 'testuser';
    const currentUserId = 1;
    const command = new FollowUserCommand(username, currentUserId);

    mockService.followUser.mockResolvedValue(mockProfileResponseDto);

    const result = await handler.execute(command);

    expect(result).toEqual(mockProfileResponseDto);
    expect(mockService.followUser).toHaveBeenCalledWith(username, currentUserId);
  });
});
