import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { UserService } from '$domains/user/services/user.service';
import { CreateUserCommand } from './create-user.command';
import { CreateUserHandler } from './create-user.handler';

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let mockService: any;

  const mockCreateUserResponseDto = {
    user: {
      email: 'test@example.com',
      username: 'testuser',
      bio: null,
      image: 'https://example.com/image.jpg',
    },
  };

  const mockDto = {
    provider: 'google',
    providerId: '123456789',
    email: 'test@example.com',
    username: 'testuser',
    image: 'https://example.com/image.jpg',
  };

  beforeEach(async () => {
    mockService = {
      createUser: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        {
          provide: UserService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<CreateUserHandler>(CreateUserHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle CreateUserCommand', async () => {
    const command = new CreateUserCommand(mockDto);

    mockService.createUser.mockResolvedValue(mockCreateUserResponseDto);

    const result = await handler.execute(command);

    expect(result).toEqual(mockCreateUserResponseDto);
    expect(mockService.createUser).toHaveBeenCalledWith(mockDto);
  });
});
