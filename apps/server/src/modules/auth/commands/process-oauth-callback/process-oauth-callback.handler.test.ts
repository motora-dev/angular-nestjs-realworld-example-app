import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ProcessOAuthCallbackCommand } from '$modules/auth/commands/process-oauth-callback/process-oauth-callback.command';
import { AuthService } from '$modules/auth/services/auth.service';
import { ProcessOAuthCallbackHandler } from './process-oauth-callback.handler';

describe('ProcessOAuthCallbackHandler', () => {
  let handler: ProcessOAuthCallbackHandler;
  let mockService: any;

  const mockUser = {
    id: 1,
    publicId: 'test-public-id',
    username: 'testuser',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    mockService = {
      findUser: vi.fn(),
      generateAccessToken: vi.fn(),
      generateRefreshToken: vi.fn(),
      generatePendingRegistrationToken: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessOAuthCallbackHandler,
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<ProcessOAuthCallbackHandler>(ProcessOAuthCallbackHandler);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return login result when user exists', async () => {
    const provider = 'google';
    const sub = '123456789';
    const email = 'test@example.com';
    const command = new ProcessOAuthCallbackCommand(provider, sub, email);

    mockService.findUser.mockResolvedValue(mockUser);
    mockService.generateAccessToken.mockReturnValue('access-token');
    mockService.generateRefreshToken.mockResolvedValue('refresh-token');

    const result = await handler.execute(command);

    expect(result).toEqual({
      type: 'login',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(mockService.findUser).toHaveBeenCalledWith(provider, sub);
    expect(mockService.generateAccessToken).toHaveBeenCalledWith(mockUser);
    expect(mockService.generateRefreshToken).toHaveBeenCalledWith(mockUser.id);
  });

  it('should return register result when user does not exist', async () => {
    const provider = 'google';
    const sub = '123456789';
    const email = 'newuser@example.com';
    const command = new ProcessOAuthCallbackCommand(provider, sub, email);

    mockService.findUser.mockResolvedValue(null);
    mockService.generatePendingRegistrationToken.mockReturnValue('pending-token');

    const result = await handler.execute(command);

    expect(result).toEqual({
      type: 'register',
      pendingToken: 'pending-token',
    });
    expect(mockService.findUser).toHaveBeenCalledWith(provider, sub);
    expect(mockService.generatePendingRegistrationToken).toHaveBeenCalledWith(provider, sub, email);
    expect(mockService.generateAccessToken).not.toHaveBeenCalled();
  });
});
