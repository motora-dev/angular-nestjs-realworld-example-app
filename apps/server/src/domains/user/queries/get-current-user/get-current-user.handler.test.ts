import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { UserService } from '$domains/user/services/user.service';
import { GetCurrentUserHandler } from './get-current-user.handler';
import { GetCurrentUserQuery } from './get-current-user.query';

describe('GetCurrentUserHandler', () => {
  let handler: GetCurrentUserHandler;
  let mockService: any;

  const mockUserResponseDto = {
    user: {
      email: 'test@example.com',
      username: 'testuser',
      bio: 'Test bio',
      image: 'https://example.com/image.jpg',
    },
  };

  beforeEach(async () => {
    mockService = {
      getCurrentUser: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurrentUserHandler,
        {
          provide: UserService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<GetCurrentUserHandler>(GetCurrentUserHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle GetCurrentUserQuery', async () => {
    const userId = 1;
    const query = new GetCurrentUserQuery(userId);

    mockService.getCurrentUser.mockResolvedValue(mockUserResponseDto);

    const result = await handler.execute(query);

    expect(result).toEqual(mockUserResponseDto);
    expect(mockService.getCurrentUser).toHaveBeenCalledWith(userId);
  });
});
