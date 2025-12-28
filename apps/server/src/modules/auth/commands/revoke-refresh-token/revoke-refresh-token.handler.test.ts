import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { RevokeRefreshTokenCommand } from '$modules/auth/commands/revoke-refresh-token/revoke-refresh-token.command';
import { AuthService } from '$modules/auth/services/auth.service';
import { RevokeRefreshTokenHandler } from './revoke-refresh-token.handler';

describe('RevokeRefreshTokenHandler', () => {
  let handler: RevokeRefreshTokenHandler;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      revokeRefreshToken: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevokeRefreshTokenHandler,
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<RevokeRefreshTokenHandler>(RevokeRefreshTokenHandler);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should revoke refresh token when token is provided', async () => {
    const refreshToken = 'test-refresh-token';
    const command = new RevokeRefreshTokenCommand(refreshToken);

    mockService.revokeRefreshToken.mockResolvedValue(undefined);

    await handler.execute(command);

    expect(mockService.revokeRefreshToken).toHaveBeenCalledWith(refreshToken);
  });

  it('should not revoke refresh token when token is undefined', async () => {
    const command = new RevokeRefreshTokenCommand(undefined);

    await handler.execute(command);

    expect(mockService.revokeRefreshToken).not.toHaveBeenCalled();
  });
});
