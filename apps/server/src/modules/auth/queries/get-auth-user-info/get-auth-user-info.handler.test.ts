import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import * as Presenters from '$modules/auth/presenters/auth.presenter';
import { AuthService } from '$modules/auth/services/auth.service';
import { NotFoundError } from '$shared/errors/app-error';
import { GetAuthUserInfoHandler } from './get-auth-user-info.handler';
import { GetAuthUserInfoQuery } from './get-auth-user-info.query';

// Mock presenters
vi.mock('$modules/auth/presenters/auth.presenter', () => ({
  toUserInfo: vi.fn(),
}));

describe('GetAuthUserInfoHandler', () => {
  let handler: GetAuthUserInfoHandler;
  let mockService: any;

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
    bio: 'Test bio',
    image: 'https://example.com/image.jpg',
  };

  const mockUserInfo = {
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio',
    image: 'https://example.com/image.jpg',
  };

  beforeEach(async () => {
    mockService = {
      findUserById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAuthUserInfoHandler,
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<GetAuthUserInfoHandler>(GetAuthUserInfoHandler);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle GetAuthUserInfoQuery', async () => {
    const query = new GetAuthUserInfoQuery(mockPayload);

    mockService.findUserById.mockResolvedValue(mockUser);
    vi.mocked(Presenters.toUserInfo).mockReturnValue(mockUserInfo);

    const result = await handler.execute(query);

    expect(result).toEqual(mockUserInfo);
    expect(mockService.findUserById).toHaveBeenCalledWith(mockPayload.id);
    expect(Presenters.toUserInfo).toHaveBeenCalledWith(mockUser);
  });

  it('should throw NotFoundError when user is not found', async () => {
    const query = new GetAuthUserInfoQuery(mockPayload);

    mockService.findUserById.mockResolvedValue(null);

    await expect(handler.execute(query)).rejects.toThrow(NotFoundError);
    expect(mockService.findUserById).toHaveBeenCalledWith(mockPayload.id);
    expect(Presenters.toUserInfo).not.toHaveBeenCalled();
  });
});
