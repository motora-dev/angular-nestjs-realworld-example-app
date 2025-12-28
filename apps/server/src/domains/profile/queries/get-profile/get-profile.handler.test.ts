import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ProfileService } from '$domains/profile/services/profile.service';
import { GetProfileHandler } from './get-profile.handler';
import { GetProfileQuery } from './get-profile.query';

describe('GetProfileHandler', () => {
  let handler: GetProfileHandler;
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
      getProfile: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileHandler,
        {
          provide: ProfileService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<GetProfileHandler>(GetProfileHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle GetProfileQuery', async () => {
    const username = 'testuser';
    const currentUserId = 1;
    const query = new GetProfileQuery(username, currentUserId);

    mockService.getProfile.mockResolvedValue(mockProfileResponseDto);

    const result = await handler.execute(query);

    expect(result).toEqual(mockProfileResponseDto);
    expect(mockService.getProfile).toHaveBeenCalledWith(username, currentUserId);
  });

  it('should handle GetProfileQuery without currentUserId', async () => {
    const username = 'testuser';
    const query = new GetProfileQuery(username);

    mockService.getProfile.mockResolvedValue(mockProfileResponseDto);

    const result = await handler.execute(query);

    expect(result).toEqual(mockProfileResponseDto);
    expect(mockService.getProfile).toHaveBeenCalledWith(username, undefined);
  });
});
