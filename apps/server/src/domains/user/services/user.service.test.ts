import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import * as Presenters from '$domains/user/presenters/user.presenter';
import { UserRepository } from '$domains/user/repositories/user.repository';
import { ConflictError, NotFoundError } from '$errors';
import { UserService } from './user.service';

// Mock presenters
vi.mock('$domains/user/presenters/user.presenter', () => ({
  toUserDto: vi.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let mockRepository: any;

  const mockUserWithAccount = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    bio: 'Test bio',
    image: 'https://example.com/image.jpg',
  };

  const mockUserDto = {
    email: 'test@example.com',
    username: 'testuser',
    bio: 'Test bio',
    image: 'https://example.com/image.jpg',
  };

  beforeEach(async () => {
    mockRepository = {
      getById: vi.fn(),
      update: vi.fn(),
      isUsernameTaken: vi.fn(),
      isEmailTaken: vi.fn(),
      create: vi.fn(),
      getByOAuthAccount: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const userId = 1;

      mockRepository.getById.mockResolvedValue(mockUserWithAccount);
      vi.mocked(Presenters.toUserDto).mockReturnValue(mockUserDto);

      const result = await service.getCurrentUser(userId);

      expect(result).toEqual({ user: mockUserDto });
      expect(mockRepository.getById).toHaveBeenCalledWith(userId);
      expect(Presenters.toUserDto).toHaveBeenCalledWith(mockUserWithAccount);
    });

    it('should throw NotFoundError when user is not found', async () => {
      const userId = 999;

      mockRepository.getById.mockResolvedValue(null);

      await expect(service.getCurrentUser(userId)).rejects.toThrow(NotFoundError);
      expect(mockRepository.getById).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 1;
      const request = {
        user: {
          email: 'newemail@example.com',
          username: 'newusername',
          bio: 'New bio',
          image: undefined,
        },
      };

      mockRepository.getById.mockResolvedValue(mockUserWithAccount);
      mockRepository.isUsernameTaken.mockResolvedValue(false);
      mockRepository.isEmailTaken.mockResolvedValue(false);
      mockRepository.update.mockResolvedValue({
        ...mockUserWithAccount,
        email: 'newemail@example.com',
        username: 'newusername',
        bio: 'New bio',
      });
      vi.mocked(Presenters.toUserDto).mockReturnValue({
        ...mockUserDto,
        email: 'newemail@example.com',
        username: 'newusername',
        bio: 'New bio',
      });

      const result = await service.updateUser(userId, request);

      expect(result).toEqual({
        user: {
          ...mockUserDto,
          email: 'newemail@example.com',
          username: 'newusername',
          bio: 'New bio',
        },
      });
      expect(mockRepository.getById).toHaveBeenCalledWith(userId);
      expect(mockRepository.update).toHaveBeenCalledWith(userId, {
        email: request.user.email,
        username: request.user.username,
        bio: request.user.bio,
        image: undefined,
      });
    });

    it('should update user without checking username when username is not provided', async () => {
      const userId = 1;
      const request = {
        user: {
          email: 'newemail@example.com',
          bio: 'New bio',
        },
      };

      mockRepository.getById.mockResolvedValue(mockUserWithAccount);
      mockRepository.isEmailTaken.mockResolvedValue(false);
      mockRepository.update.mockResolvedValue({
        ...mockUserWithAccount,
        email: 'newemail@example.com',
        bio: 'New bio',
      });
      vi.mocked(Presenters.toUserDto).mockReturnValue({
        ...mockUserDto,
        email: 'newemail@example.com',
        bio: 'New bio',
      });

      const result = await service.updateUser(userId, request);

      expect(result).toEqual({
        user: {
          ...mockUserDto,
          email: 'newemail@example.com',
          bio: 'New bio',
        },
      });
      expect(mockRepository.isUsernameTaken).not.toHaveBeenCalled();
      expect(mockRepository.isEmailTaken).toHaveBeenCalledWith('newemail@example.com', userId);
    });

    it('should update user without checking email when email is not provided', async () => {
      const userId = 1;
      const request = {
        user: {
          username: 'newusername',
          bio: 'New bio',
        },
      };

      mockRepository.getById.mockResolvedValue(mockUserWithAccount);
      mockRepository.isUsernameTaken.mockResolvedValue(false);
      mockRepository.update.mockResolvedValue({
        ...mockUserWithAccount,
        username: 'newusername',
        bio: 'New bio',
      });
      vi.mocked(Presenters.toUserDto).mockReturnValue({
        ...mockUserDto,
        username: 'newusername',
        bio: 'New bio',
      });

      const result = await service.updateUser(userId, request);

      expect(result).toEqual({
        user: {
          ...mockUserDto,
          username: 'newusername',
          bio: 'New bio',
        },
      });
      expect(mockRepository.isUsernameTaken).toHaveBeenCalledWith('newusername', userId);
      expect(mockRepository.isEmailTaken).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when user is not found', async () => {
      const userId = 999;
      const request = {
        user: {
          email: 'newemail@example.com',
        },
      };

      mockRepository.getById.mockResolvedValue(null);

      await expect(service.updateUser(userId, request)).rejects.toThrow(NotFoundError);
      expect(mockRepository.getById).toHaveBeenCalledWith(userId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when username is already taken', async () => {
      const userId = 1;
      const request = {
        user: {
          username: 'takenusername',
        },
      };

      mockRepository.getById.mockResolvedValue(mockUserWithAccount);
      mockRepository.isUsernameTaken.mockResolvedValue(true);

      await expect(service.updateUser(userId, request)).rejects.toThrow(ConflictError);
      expect(mockRepository.isUsernameTaken).toHaveBeenCalledWith(request.user.username, userId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when email is already taken', async () => {
      const userId = 1;
      const request = {
        user: {
          email: 'taken@example.com',
        },
      };

      mockRepository.getById.mockResolvedValue(mockUserWithAccount);
      mockRepository.isEmailTaken.mockResolvedValue(true);

      await expect(service.updateUser(userId, request)).rejects.toThrow(ConflictError);
      expect(mockRepository.isEmailTaken).toHaveBeenCalledWith(request.user.email, userId);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const dto = {
        provider: 'google',
        providerId: '123456789',
        email: 'test@example.com',
        username: 'testuser',
        image: 'https://example.com/image.jpg',
      };

      mockRepository.isUsernameTaken.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue(mockUserWithAccount);
      vi.mocked(Presenters.toUserDto).mockReturnValue(mockUserDto);

      const result = await service.createUser(dto);

      expect(result).toEqual({ user: mockUserDto });
      expect(mockRepository.isUsernameTaken).toHaveBeenCalledWith(dto.username);
      expect(mockRepository.create).toHaveBeenCalledWith({
        provider: dto.provider,
        providerId: dto.providerId,
        email: dto.email,
        username: dto.username,
        image: dto.image,
      });
    });

    it('should throw ConflictError when username is already taken', async () => {
      const dto = {
        provider: 'google',
        providerId: '123456789',
        email: 'test@example.com',
        username: 'takenusername',
        image: 'https://example.com/image.jpg',
      };

      mockRepository.isUsernameTaken.mockResolvedValue(true);

      await expect(service.createUser(dto)).rejects.toThrow(ConflictError);
      expect(mockRepository.isUsernameTaken).toHaveBeenCalledWith(dto.username);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getOrCreateUser', () => {
    it('should return user when found', async () => {
      const provider = 'google';
      const providerId = '123456789';

      mockRepository.getByOAuthAccount.mockResolvedValue(mockUserWithAccount);
      vi.mocked(Presenters.toUserDto).mockReturnValue(mockUserDto);

      const result = await service.getOrCreateUser(provider, providerId);

      expect(result).toEqual({ user: mockUserDto });
      expect(mockRepository.getByOAuthAccount).toHaveBeenCalledWith(provider, providerId);
    });

    it('should return null when user is not found', async () => {
      const provider = 'google';
      const providerId = '123456789';

      mockRepository.getByOAuthAccount.mockResolvedValue(null);

      const result = await service.getOrCreateUser(provider, providerId);

      expect(result).toBeNull();
      expect(mockRepository.getByOAuthAccount).toHaveBeenCalledWith(provider, providerId);
    });
  });

  describe('updateUser - image field handling', () => {
    it('should update user with image field when provided', async () => {
      const userId = 1;
      const request = {
        user: {
          email: 'newemail@example.com',
          username: 'newusername',
          bio: 'New bio',
          image: 'https://example.com/new-image.jpg',
        },
      };

      mockRepository.getById.mockResolvedValue(mockUserWithAccount);
      mockRepository.isUsernameTaken.mockResolvedValue(false);
      mockRepository.isEmailTaken.mockResolvedValue(false);
      mockRepository.update.mockResolvedValue({
        ...mockUserWithAccount,
        ...request.user,
      });
      vi.mocked(Presenters.toUserDto).mockReturnValue({
        ...mockUserDto,
        ...request.user,
      });

      const result = await service.updateUser(userId, request);

      expect(result).toEqual({
        user: {
          ...mockUserDto,
          ...request.user,
        },
      });
      expect(mockRepository.update).toHaveBeenCalledWith(userId, {
        email: request.user.email,
        username: request.user.username,
        bio: request.user.bio,
        image: request.user.image,
      });
    });

    it('should handle undefined image field in request', async () => {
      const userId = 1;
      const request = {
        user: {
          email: 'newemail@example.com',
          username: 'newusername',
          bio: 'New bio',
        },
      };

      mockRepository.getById.mockResolvedValue(mockUserWithAccount);
      mockRepository.isUsernameTaken.mockResolvedValue(false);
      mockRepository.isEmailTaken.mockResolvedValue(false);
      mockRepository.update.mockResolvedValue({
        ...mockUserWithAccount,
        email: request.user.email,
        username: request.user.username,
        bio: request.user.bio,
      });
      vi.mocked(Presenters.toUserDto).mockReturnValue({
        ...mockUserDto,
        email: request.user.email,
        username: request.user.username,
        bio: request.user.bio,
      });

      await service.updateUser(userId, request);

      expect(mockRepository.update).toHaveBeenCalledWith(userId, {
        email: request.user.email,
        username: request.user.username,
        bio: request.user.bio,
        image: undefined,
      });
    });
  });
});
