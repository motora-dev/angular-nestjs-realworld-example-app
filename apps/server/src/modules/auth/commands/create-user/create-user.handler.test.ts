import { ERROR_CODE } from '@monorepo/error-code';
import { Test, TestingModule } from '@nestjs/testing';

import { NotFoundError } from '$errors';
import { AuthService } from '$modules/auth/services/auth.service';
import { CreateUserCommand } from './create-user.command';
import { CreateUserFromGoogleHandler } from './create-user.handler';

describe('CreateUserFromGoogleHandler', () => {
  let handler: CreateUserFromGoogleHandler;
  let mockAuthService: any;

  const mockUser = {
    id: 1,
    publicId: 'test-public-id',
    email: 'test@gmail.com',
    username: 'testuser',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockAuthService = {
      findUser: vi.fn().mockResolvedValue(mockUser),
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
    it('should succeed when user exists', async () => {
      mockAuthService.findUser.mockResolvedValue(mockUser as any);

      const googleId = 'test-google-id';
      const googleEmail = 'test@gmail.com';
      const command = new CreateUserCommand('google', googleId, googleEmail);

      await handler.execute(command);

      expect(mockAuthService.findUser).toHaveBeenCalledWith('google', googleId);
    });

    it('should throw NotFoundError when user not found', async () => {
      mockAuthService.findUser.mockResolvedValue(null);

      const command = new CreateUserCommand('google', 'new-google-id', 'new@gmail.com');

      await expect(handler.execute(command)).rejects.toThrow(new NotFoundError(ERROR_CODE.USER_NOT_FOUND));
      expect(mockAuthService.findUser).toHaveBeenCalledWith('google', 'new-google-id');
    });
  });
});
