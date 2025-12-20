import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '$modules/auth/services/auth.service';
import { CreateUserCommand } from './create-user.command';
import { CreateUserFromGoogleHandler } from './create-user.handler';

describe('CreateUserFromGoogleHandler', () => {
  let handler: CreateUserFromGoogleHandler;
  let mockAuthService: any;

  const mockUser = {
    id: 1,
    microsoftId: null,
    microsoftEmail: null,
    googleId: 'test-google-id',
    googleEmail: 'test@gmail.com',
    name: 'Test Google User',
    userName: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    stories: [],
  };

  beforeEach(async () => {
    mockAuthService = {
      findOrCreateUser: vi.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserFromGoogleHandler,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    handler = module.get<CreateUserFromGoogleHandler>(CreateUserFromGoogleHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should process CreateUserFromGoogle command', async () => {
      mockAuthService.findOrCreateUser.mockResolvedValue(mockUser as any);

      const googleId = 'test-google-id';
      const googleEmail = 'test@gmail.com';
      const command = new CreateUserCommand('google', googleId, googleEmail);

      await handler.execute(command);

      expect(mockAuthService.findOrCreateUser).toHaveBeenCalledWith('google', googleId, googleEmail);
    });

    it('should handle error from auth service', async () => {
      const error = new Error('Google認証エラー');
      mockAuthService.findOrCreateUser.mockRejectedValue(error);

      const command = new CreateUserCommand('google', 'invalid-google-id', 'invalid@gmail.com');

      await expect(handler.execute(command)).rejects.toThrow('Google認証エラー');
      expect(mockAuthService.findOrCreateUser).toHaveBeenCalledWith('google', 'invalid-google-id', 'invalid@gmail.com');
    });
  });
});
