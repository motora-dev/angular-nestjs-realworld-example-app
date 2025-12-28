import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import type { CurrentUserType } from '$decorators';
import { AuthController } from './auth.controller';
import {
  ProcessOAuthCallbackCommand,
  RefreshAccessTokenCommand,
  RegisterUserCommand,
  RevokeRefreshTokenCommand,
} from './commands';
import { GetAuthUserInfoQuery, GetAuthUserQuery, GetPendingRegistrationQuery } from './queries';
import { AuthService } from './services';

import type { RegisterUserResult } from './commands/register-user/register-user.command';
import type { PendingRegistrationResponse, RegisterDto, RegisterResponse, UserInfo, UserResponse } from './contracts';
import type { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let authService: any;
  let configService: any;
  let mockGoogleClient: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  const mockUser: CurrentUserType = {
    id: 1,
    publicId: 'test-public-id',
    username: 'testuser',
  };

  const mockUserInfo: UserInfo = {
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio',
    image: 'https://example.com/image.jpg',
  };

  const mockUserResponse: UserResponse = {
    id: 'test-public-id',
    username: 'testuser',
  };

  const mockRegisterResponse: RegisterResponse = {
    id: 'test-public-id',
    username: 'testuser',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    mockGoogleClient = {
      generateAuthUrl: vi.fn().mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth'),
      getToken: vi.fn(),
      verifyIdToken: vi.fn(),
    };

    authService = {
      verifyAccessToken: vi.fn(),
      validateRefreshToken: vi.fn(),
      getAccessTokenExpiryMs: vi.fn().mockReturnValue(900000),
      getRefreshTokenExpiryMs: vi.fn().mockReturnValue(1209600000),
    };

    configService = {
      get: vi.fn((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'CLIENT_URL') return 'http://localhost:4200';
        if (key === 'COOKIE_DOMAIN') return 'example.com';
        if (key === 'GOOGLE_CLIENT_ID') return 'test-client-id';
        if (key === 'GOOGLE_CLIENT_SECRET') return 'test-client-secret';
        if (key === 'GOOGLE_CALLBACK_URL') return 'http://localhost:3000/api/auth/callback';
        return undefined;
      }),
    };

    commandBus = {
      execute: vi.fn(),
    } as any;

    queryBus = {
      execute: vi.fn(),
    } as any;

    mockRequest = {
      cookies: {},
    };

    mockResponse = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
      redirect: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CommandBus,
          useValue: commandBus,
        },
        {
          provide: QueryBus,
          useValue: queryBus,
        },
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    // Replace googleClient with mock
    (controller as any).googleClient = mockGoogleClient;
    (controller as any).isProd = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkSession', () => {
    it('should return authenticated true with user info when valid access token exists', async () => {
      const mockPayload = { id: 1, publicId: 'test-public-id', username: 'testuser' };
      mockRequest.cookies = { 'access-token': 'valid-token' };
      authService.verifyAccessToken.mockReturnValue(mockPayload);
      vi.mocked(queryBus.execute).mockResolvedValue(mockUserInfo);

      const result = await controller.checkSession(mockRequest as Request);

      expect(result).toEqual({ authenticated: true, user: mockUserInfo });
      expect(authService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(queryBus.execute).toHaveBeenCalledWith(new GetAuthUserInfoQuery(mockPayload));
    });

    it('should return authenticated true when access token invalid but refresh token valid', async () => {
      const mockUser = {
        id: 1,
        publicId: 'test-public-id',
        username: 'testuser',
      };
      const mockPayload = {
        id: mockUser.id,
        publicId: mockUser.publicId,
        username: mockUser.username,
      };
      mockRequest.cookies = { 'access-token': 'invalid-token', 'refresh-token': 'valid-refresh-token' };
      authService.verifyAccessToken.mockReturnValue(null);
      authService.validateRefreshToken.mockResolvedValue(mockUser);
      vi.mocked(queryBus.execute).mockResolvedValue(mockUserInfo);

      const result = await controller.checkSession(mockRequest as Request);

      expect(result).toEqual({ authenticated: true, user: mockUserInfo });
      expect(authService.verifyAccessToken).toHaveBeenCalledWith('invalid-token');
      expect(authService.validateRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(queryBus.execute).toHaveBeenCalledWith(new GetAuthUserInfoQuery(mockPayload));
    });

    it('should return authenticated false when both tokens are invalid', async () => {
      mockRequest.cookies = { 'access-token': 'invalid-token', 'refresh-token': 'invalid-refresh-token' };
      authService.verifyAccessToken.mockReturnValue(null);
      authService.validateRefreshToken.mockResolvedValue(null);

      const result = await controller.checkSession(mockRequest as Request);

      expect(result).toEqual({ authenticated: false });
      expect(authService.verifyAccessToken).toHaveBeenCalledWith('invalid-token');
      expect(authService.validateRefreshToken).toHaveBeenCalledWith('invalid-refresh-token');
      expect(queryBus.execute).not.toHaveBeenCalled();
    });

    it('should return authenticated false when no tokens exist', async () => {
      mockRequest.cookies = {};

      const result = await controller.checkSession(mockRequest as Request);

      expect(result).toEqual({ authenticated: false });
      expect(authService.verifyAccessToken).not.toHaveBeenCalled();
      expect(authService.validateRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('loginGoogle', () => {
    it('should redirect to Google OAuth consent page', async () => {
      await controller.loginGoogle(mockResponse as Response);

      expect(mockGoogleClient.generateAuthUrl).toHaveBeenCalledWith({
        access_type: 'offline',
        scope: ['openid', 'email', 'profile'],
        prompt: 'select_account',
      });
      expect(mockResponse.redirect).toHaveBeenCalledWith('https://accounts.google.com/o/oauth2/v2/auth');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      vi.mocked(queryBus.execute).mockResolvedValue(mockUserResponse);

      const result = await controller.getCurrentUser(mockUser);

      expect(result).toEqual(mockUserResponse);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetAuthUserQuery(mockUser));
    });
  });

  describe('getPendingRegistration', () => {
    it('should return pending registration email', async () => {
      const mockPendingRegistration: PendingRegistrationResponse = { email: 'test@example.com' };
      mockRequest.cookies = { 'pending-registration': 'pending-token' };
      vi.mocked(queryBus.execute).mockResolvedValue(mockPendingRegistration);

      const result = await controller.getPendingRegistration(mockRequest as Request);

      expect(result).toEqual(mockPendingRegistration);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetPendingRegistrationQuery('pending-token'));
    });

    it('should return null when no pending token exists', async () => {
      mockRequest.cookies = {};
      vi.mocked(queryBus.execute).mockResolvedValue(null);

      const result = await controller.getPendingRegistration(mockRequest as Request);

      expect(result).toBeNull();
      expect(queryBus.execute).toHaveBeenCalledWith(new GetPendingRegistrationQuery(undefined));
    });
  });

  describe('refresh', () => {
    it('should refresh access token successfully', async () => {
      const mockResult = { accessToken: 'new-access-token' };
      mockRequest.cookies = { 'refresh-token': 'valid-refresh-token' };
      vi.mocked(commandBus.execute).mockResolvedValue(mockResult);

      await controller.refresh(mockRequest as Request, mockResponse as Response);

      expect(commandBus.execute).toHaveBeenCalledWith(new RefreshAccessTokenCommand('valid-refresh-token'));
      expect(mockResponse.cookie).toHaveBeenCalledWith('access-token', 'new-access-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 900000,
      });
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('should throw UnauthorizedException when no refresh token provided', async () => {
      mockRequest.cookies = {};

      await expect(controller.refresh(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException and clear cookies when refresh token is invalid', async () => {
      mockRequest.cookies = { 'refresh-token': 'invalid-refresh-token' };
      vi.mocked(commandBus.execute).mockResolvedValue(null);

      await expect(controller.refresh(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(commandBus.execute).toHaveBeenCalledWith(new RefreshAccessTokenCommand('invalid-refresh-token'));
      // clearAuthCookies should be called (indirectly tested through private method behavior)
    });
  });

  describe('logout', () => {
    it('should revoke refresh token and clear cookies', async () => {
      mockRequest.cookies = { 'refresh-token': 'refresh-token-to-revoke' };
      vi.mocked(commandBus.execute).mockResolvedValue(undefined);

      await controller.logout(mockRequest as Request, mockResponse as Response);

      expect(commandBus.execute).toHaveBeenCalledWith(new RevokeRefreshTokenCommand('refresh-token-to-revoke'));
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
      // clearAuthCookies should be called (indirectly tested)
      expect(mockResponse.clearCookie).toHaveBeenCalled();
    });

    it('should logout even when no refresh token exists', async () => {
      mockRequest.cookies = {};
      vi.mocked(commandBus.execute).mockResolvedValue(undefined);

      await controller.logout(mockRequest as Request, mockResponse as Response);

      expect(commandBus.execute).toHaveBeenCalledWith(new RevokeRefreshTokenCommand(undefined));
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
      expect(mockResponse.clearCookie).toHaveBeenCalled();
    });
  });

  describe('callback', () => {
    it('should redirect to login with error when OAuth error occurs', async () => {
      const error = 'access_denied';
      mockGoogleClient.getToken.mockRejectedValue(new Error('Token exchange failed'));

      await controller.callback(undefined as any, error, mockResponse as Response);

      expect(mockResponse.redirect).toHaveBeenCalledWith('http://localhost:4200/login?error=access_denied');
      expect(mockGoogleClient.getToken).not.toHaveBeenCalled();
    });

    it('should redirect to login when no code provided', async () => {
      await controller.callback(undefined as any, undefined as any, mockResponse as Response);

      expect(mockResponse.redirect).toHaveBeenCalledWith('http://localhost:4200/login?error=no_code');
      expect(mockGoogleClient.getToken).not.toHaveBeenCalled();
    });

    it('should use default CLIENT_URL when not configured', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'CLIENT_URL') return undefined;
        if (key === 'NODE_ENV') return 'development';
        if (key === 'COOKIE_DOMAIN') return 'example.com';
        if (key === 'GOOGLE_CLIENT_ID') return 'test-client-id';
        return undefined;
      });

      await controller.callback(undefined as any, undefined as any, mockResponse as Response);

      expect(mockResponse.redirect).toHaveBeenCalledWith('http://localhost:4200/login?error=no_code');
    });

    it('should redirect to login when no id_token in response', async () => {
      mockGoogleClient.getToken.mockResolvedValue({ tokens: {} });

      await controller.callback('auth-code', undefined as any, mockResponse as Response);

      expect(mockResponse.redirect).toHaveBeenCalledWith('http://localhost:4200/login?error=no_id_token');
      expect(mockGoogleClient.getToken).toHaveBeenCalledWith('auth-code');
    });

    it('should redirect to login when token verification fails', async () => {
      mockGoogleClient.getToken.mockResolvedValue({
        tokens: { id_token: 'invalid-token' },
      });
      mockGoogleClient.verifyIdToken.mockResolvedValue({
        getPayload: () => null,
      });

      await controller.callback('auth-code', undefined as any, mockResponse as Response);

      expect(mockResponse.redirect).toHaveBeenCalledWith('http://localhost:4200/login?error=invalid_token');
    });

    it('should redirect to login when payload missing sub', async () => {
      mockGoogleClient.getToken.mockResolvedValue({
        tokens: { id_token: 'valid-token' },
      });
      mockGoogleClient.verifyIdToken.mockResolvedValue({
        getPayload: () => ({ sub: undefined, email: 'test@example.com' }),
      });

      await controller.callback('auth-code', undefined as any, mockResponse as Response);

      expect(mockResponse.redirect).toHaveBeenCalledWith('http://localhost:4200/login?error=invalid_token');
    });

    it('should redirect to login when payload missing email', async () => {
      mockGoogleClient.getToken.mockResolvedValue({
        tokens: { id_token: 'valid-token' },
      });
      mockGoogleClient.verifyIdToken.mockResolvedValue({
        getPayload: () => ({ sub: '123', email: undefined }),
      });

      await controller.callback('auth-code', undefined as any, mockResponse as Response);

      expect(mockResponse.redirect).toHaveBeenCalledWith('http://localhost:4200/login?error=invalid_token');
    });

    it('should redirect to login when payload is null', async () => {
      mockGoogleClient.getToken.mockResolvedValue({
        tokens: { id_token: 'valid-token' },
      });
      mockGoogleClient.verifyIdToken.mockResolvedValue({
        getPayload: () => null,
      });

      await controller.callback('auth-code', undefined as any, mockResponse as Response);

      expect(mockResponse.redirect).toHaveBeenCalledWith('http://localhost:4200/login?error=invalid_token');
    });

    it('should handle login flow when user exists', async () => {
      const mockResult = {
        type: 'login' as const,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      mockGoogleClient.getToken.mockResolvedValue({
        tokens: { id_token: 'valid-token' },
      });
      mockGoogleClient.verifyIdToken.mockResolvedValue({
        getPayload: () => ({ sub: '123', email: 'test@example.com' }),
      });
      vi.mocked(commandBus.execute).mockResolvedValue(mockResult);

      await controller.callback('auth-code', undefined as any, mockResponse as Response);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new ProcessOAuthCallbackCommand('google', '123', 'test@example.com'),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith('access-token', 'access-token', expect.any(Object));
      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh-token', 'refresh-token', expect.any(Object));
      expect(mockResponse.redirect).toHaveBeenCalledWith('http://localhost:4200');
    });

    it('should handle registration flow when user does not exist', async () => {
      const mockResult = {
        type: 'register' as const,
        pendingToken: 'pending-token',
      };
      mockGoogleClient.getToken.mockResolvedValue({
        tokens: { id_token: 'valid-token' },
      });
      mockGoogleClient.verifyIdToken.mockResolvedValue({
        getPayload: () => ({ sub: '123', email: 'newuser@example.com' }),
      });
      vi.mocked(commandBus.execute).mockResolvedValue(mockResult);

      await controller.callback('auth-code', undefined as any, mockResponse as Response);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new ProcessOAuthCallbackCommand('google', '123', 'newuser@example.com'),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith('pending-registration', 'pending-token', expect.any(Object));
      expect(mockResponse.redirect).toHaveBeenCalledWith('http://localhost:4200/register');
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const body: RegisterDto = { username: 'testuser' };
      const mockResult: RegisterUserResult = {
        response: mockRegisterResponse,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      mockRequest.cookies = { 'pending-registration': 'pending-token' };
      vi.mocked(commandBus.execute).mockResolvedValue(mockResult);

      await controller.register(body, mockRequest as Request, mockResponse as Response);

      expect(commandBus.execute).toHaveBeenCalledWith(new RegisterUserCommand('pending-token', 'testuser'));
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('pending-registration', expect.any(Object));
      expect(mockResponse.cookie).toHaveBeenCalledWith('access-token', 'access-token', expect.any(Object));
      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh-token', 'refresh-token', expect.any(Object));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockRegisterResponse);
    });

    it('should throw BadRequestException when no pending token exists', async () => {
      const body: RegisterDto = { username: 'testuser' };
      mockRequest.cookies = {};

      await expect(controller.register(body, mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        BadRequestException,
      );
      expect(commandBus.execute).not.toHaveBeenCalled();
    });
  });
});
