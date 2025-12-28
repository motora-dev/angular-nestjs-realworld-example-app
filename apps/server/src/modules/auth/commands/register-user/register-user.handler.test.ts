import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ConflictError, UnauthorizedError } from '$errors';
import { RegisterUserCommand } from '$modules/auth/commands/register-user/register-user.command';
import * as Presenters from '$modules/auth/presenters/auth.presenter';
import { AuthService } from '$modules/auth/services/auth.service';
import { RegisterUserHandler } from './register-user.handler';

// Mock presenters
vi.mock('$modules/auth/presenters/auth.presenter', () => ({
  toRegisterResponse: vi.fn(),
}));

describe('RegisterUserHandler', () => {
  let handler: RegisterUserHandler;
  let mockService: any;

  const mockUser = {
    id: 1,
    publicId: 'test-public-id',
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockRegisterResponse = {
    id: 'test-public-id',
    username: 'testuser',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    mockService = {
      verifyPendingRegistrationToken: vi.fn(),
      isUsernameTaken: vi.fn(),
      findUserByEmail: vi.fn(),
      registerUser: vi.fn(),
      generateAccessToken: vi.fn(),
      generateRefreshToken: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserHandler,
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<RegisterUserHandler>(RegisterUserHandler);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should register user successfully', async () => {
    const pendingToken = 'valid-token';
    const username = 'testuser';
    const command = new RegisterUserCommand(pendingToken, username);

    const mockPending = {
      provider: 'google',
      sub: '123456789',
      email: 'test@example.com',
    };

    mockService.verifyPendingRegistrationToken.mockReturnValue(mockPending);
    mockService.isUsernameTaken.mockResolvedValue(false);
    mockService.findUserByEmail.mockResolvedValue(null);
    mockService.registerUser.mockResolvedValue(mockUser);
    mockService.generateAccessToken.mockReturnValue('access-token');
    mockService.generateRefreshToken.mockResolvedValue('refresh-token');
    vi.mocked(Presenters.toRegisterResponse).mockReturnValue(mockRegisterResponse);

    const result = await handler.execute(command);

    expect(result).toEqual({
      response: mockRegisterResponse,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(mockService.verifyPendingRegistrationToken).toHaveBeenCalledWith(pendingToken);
    expect(mockService.isUsernameTaken).toHaveBeenCalledWith(username);
    expect(mockService.findUserByEmail).toHaveBeenCalledWith(mockPending.email);
    expect(mockService.registerUser).toHaveBeenCalledWith(
      mockPending.provider,
      mockPending.sub,
      mockPending.email,
      username,
    );
    expect(mockService.generateAccessToken).toHaveBeenCalledWith(mockUser);
    expect(mockService.generateRefreshToken).toHaveBeenCalledWith(mockUser.id);
    expect(Presenters.toRegisterResponse).toHaveBeenCalledWith(mockUser);
  });

  it('should throw UnauthorizedError when pending token is invalid', async () => {
    const pendingToken = 'invalid-token';
    const username = 'testuser';
    const command = new RegisterUserCommand(pendingToken, username);

    mockService.verifyPendingRegistrationToken.mockReturnValue(null);

    await expect(handler.execute(command)).rejects.toThrow(UnauthorizedError);
    expect(mockService.verifyPendingRegistrationToken).toHaveBeenCalledWith(pendingToken);
    expect(mockService.isUsernameTaken).not.toHaveBeenCalled();
  });

  it('should throw ConflictError when username is already taken', async () => {
    const pendingToken = 'valid-token';
    const username = 'takenuser';
    const command = new RegisterUserCommand(pendingToken, username);

    const mockPending = {
      provider: 'google',
      sub: '123456789',
      email: 'test@example.com',
    };

    mockService.verifyPendingRegistrationToken.mockReturnValue(mockPending);
    mockService.isUsernameTaken.mockResolvedValue(true);

    await expect(handler.execute(command)).rejects.toThrow(ConflictError);
    expect(mockService.isUsernameTaken).toHaveBeenCalledWith(username);
    expect(mockService.registerUser).not.toHaveBeenCalled();
  });

  it('should throw ConflictError when email is already registered', async () => {
    const pendingToken = 'valid-token';
    const username = 'testuser';
    const command = new RegisterUserCommand(pendingToken, username);

    const mockPending = {
      provider: 'google',
      sub: '123456789',
      email: 'existing@example.com',
    };

    mockService.verifyPendingRegistrationToken.mockReturnValue(mockPending);
    mockService.isUsernameTaken.mockResolvedValue(false);
    mockService.findUserByEmail.mockResolvedValue(mockUser);

    await expect(handler.execute(command)).rejects.toThrow(ConflictError);
    expect(mockService.findUserByEmail).toHaveBeenCalledWith(mockPending.email);
    expect(mockService.registerUser).not.toHaveBeenCalled();
  });
});
