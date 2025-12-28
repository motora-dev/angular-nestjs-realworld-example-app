import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { UserService } from '$domains/user/services/user.service';
import { UpdateUserCommand } from './update-user.command';
import { UpdateUserHandler } from './update-user.handler';

describe('UpdateUserHandler', () => {
  let handler: UpdateUserHandler;
  let mockService: any;

  const mockUserResponseDto = {
    user: {
      email: 'newemail@example.com',
      username: 'newusername',
      bio: 'New bio',
      image: 'https://example.com/new-image.jpg',
    },
  };

  const mockRequest = {
    user: {
      email: 'newemail@example.com',
      username: 'newusername',
      bio: 'New bio',
      image: 'https://example.com/new-image.jpg',
    },
  };

  beforeEach(async () => {
    mockService = {
      updateUser: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserHandler,
        {
          provide: UserService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<UpdateUserHandler>(UpdateUserHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle UpdateUserCommand', async () => {
    const userId = 1;
    const command = new UpdateUserCommand(userId, mockRequest);

    mockService.updateUser.mockResolvedValue(mockUserResponseDto);

    const result = await handler.execute(command);

    expect(result).toEqual(mockUserResponseDto);
    expect(mockService.updateUser).toHaveBeenCalledWith(userId, mockRequest);
  });
});
