import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { RefreshAccessTokenCommand } from '$modules/auth/commands/refresh-access-token/refresh-access-token.command';
import { AuthService } from '$modules/auth/services/auth.service';
import { RefreshAccessTokenHandler } from './refresh-access-token.handler';

describe('RefreshAccessTokenHandler', () => {
  let handler: RefreshAccessTokenHandler;
  let mockService: any;

  const mockUser = {
    id: 1,
    publicId: 'test-public-id',
    username: 'testuser',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    mockService = {
      validateRefreshToken: vi.fn(),
      generateAccessToken: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshAccessTokenHandler,
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<RefreshAccessTokenHandler>(RefreshAccessTokenHandler);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return access token when refresh token is valid', async () => {
    const refreshToken = 'valid-refresh-token';
    const command = new RefreshAccessTokenCommand(refreshToken);

    mockService.validateRefreshToken.mockResolvedValue(mockUser);
    mockService.generateAccessToken.mockReturnValue('new-access-token');

    const result = await handler.execute(command);

    expect(result).toEqual({
      accessToken: 'new-access-token',
    });
    expect(mockService.validateRefreshToken).toHaveBeenCalledWith(refreshToken);
    expect(mockService.generateAccessToken).toHaveBeenCalledWith(mockUser);
  });

  it('should return null when refresh token is invalid', async () => {
    const refreshToken = 'invalid-refresh-token';
    const command = new RefreshAccessTokenCommand(refreshToken);

    mockService.validateRefreshToken.mockResolvedValue(null);

    const result = await handler.execute(command);

    expect(result).toBeNull();
    expect(mockService.validateRefreshToken).toHaveBeenCalledWith(refreshToken);
    expect(mockService.generateAccessToken).not.toHaveBeenCalled();
  });
});
