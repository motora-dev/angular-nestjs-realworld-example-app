import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { UnauthorizedError } from '$errors';
import { AuthService } from '$modules/auth/services/auth.service';
import { GoogleAuthGuard } from './google-auth.guard';

describe('GoogleAuthGuard', () => {
  let guard: GoogleAuthGuard;
  let mockAuthService: any;
  let mockConfigService: any;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: any;
  let mockResponse: any;

  const mockPayload = {
    id: 1,
    publicId: 'test-public-id',
    username: 'testuser',
  };

  const mockUser = {
    id: 1,
    publicId: 'test-public-id',
    username: 'testuser',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    mockAuthService = {
      verifyAccessToken: vi.fn(),
      validateRefreshToken: vi.fn(),
      generateAccessToken: vi.fn(),
      getAccessTokenExpiryMs: vi.fn().mockReturnValue(900000), // 15 minutes
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'COOKIE_DOMAIN') return 'example.com';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleAuthGuard,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<GoogleAuthGuard>(GoogleAuthGuard);

    mockRequest = {
      cookies: {},
      user: undefined,
    };

    mockResponse = {
      cookie: vi.fn(),
    };

    mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(mockRequest),
        getResponse: vi.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ExecutionContext;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when valid access token is provided', async () => {
      mockRequest.cookies['access-token'] = 'valid-access-token';
      mockAuthService.verifyAccessToken.mockReturnValue(mockPayload);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockAuthService.verifyAccessToken).toHaveBeenCalledWith('valid-access-token');
      expect(mockRequest.user).toEqual({
        id: mockPayload.id,
        publicId: mockPayload.publicId,
        username: mockPayload.username,
      });
      expect(mockAuthService.validateRefreshToken).not.toHaveBeenCalled();
    });

    it('should refresh access token when access token is invalid but refresh token is valid', async () => {
      mockRequest.cookies['access-token'] = 'invalid-access-token';
      mockRequest.cookies['refresh-token'] = 'valid-refresh-token';
      mockAuthService.verifyAccessToken.mockReturnValue(null);
      mockAuthService.validateRefreshToken.mockResolvedValue(mockUser);
      mockAuthService.generateAccessToken.mockReturnValue('new-access-token');

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockAuthService.verifyAccessToken).toHaveBeenCalledWith('invalid-access-token');
      expect(mockAuthService.validateRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(mockAuthService.generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.cookie).toHaveBeenCalledWith('access-token', 'new-access-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 900000,
        domain: 'example.com',
      });
      expect(mockRequest.user).toEqual({
        id: mockUser.id,
        publicId: mockUser.publicId,
        username: mockUser.username,
      });
    });

    it('should use secure cookies in production', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        if (key === 'COOKIE_DOMAIN') return 'example.com';
        return undefined;
      });

      // Re-create guard with production config
      const productionModule: TestingModule = await Test.createTestingModule({
        providers: [
          GoogleAuthGuard,
          {
            provide: AuthService,
            useValue: mockAuthService,
          },
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const productionGuard = productionModule.get<GoogleAuthGuard>(GoogleAuthGuard);

      mockRequest.cookies['access-token'] = 'invalid-access-token';
      mockRequest.cookies['refresh-token'] = 'valid-refresh-token';
      mockAuthService.verifyAccessToken.mockReturnValue(null);
      mockAuthService.validateRefreshToken.mockResolvedValue(mockUser);
      mockAuthService.generateAccessToken.mockReturnValue('new-access-token');

      mockExecutionContext = {
        switchToHttp: vi.fn().mockReturnValue({
          getRequest: vi.fn().mockReturnValue(mockRequest),
          getResponse: vi.fn().mockReturnValue(mockResponse),
        }),
      } as unknown as ExecutionContext;

      await productionGuard.canActivate(mockExecutionContext);

      expect(mockResponse.cookie).toHaveBeenCalledWith('access-token', 'new-access-token', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 900000,
        domain: 'example.com',
      });
    });

    it('should throw UnauthorizedError when both tokens are missing', async () => {
      mockRequest.cookies = {};
      mockAuthService.verifyAccessToken.mockReturnValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedError);
      expect(mockAuthService.verifyAccessToken).not.toHaveBeenCalled();
      expect(mockAuthService.validateRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when access token is invalid and refresh token is missing', async () => {
      mockRequest.cookies['access-token'] = 'invalid-access-token';
      mockAuthService.verifyAccessToken.mockReturnValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedError);
      expect(mockAuthService.verifyAccessToken).toHaveBeenCalledWith('invalid-access-token');
      expect(mockAuthService.validateRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when access token is invalid and refresh token is invalid', async () => {
      mockRequest.cookies['access-token'] = 'invalid-access-token';
      mockRequest.cookies['refresh-token'] = 'invalid-refresh-token';
      mockAuthService.verifyAccessToken.mockReturnValue(null);
      mockAuthService.validateRefreshToken.mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedError);
      expect(mockAuthService.verifyAccessToken).toHaveBeenCalledWith('invalid-access-token');
      expect(mockAuthService.validateRefreshToken).toHaveBeenCalledWith('invalid-refresh-token');
      expect(mockAuthService.generateAccessToken).not.toHaveBeenCalled();
    });

    it('should handle missing cookies object', async () => {
      mockRequest.cookies = undefined;
      mockAuthService.verifyAccessToken.mockReturnValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedError);
    });
  });
});
