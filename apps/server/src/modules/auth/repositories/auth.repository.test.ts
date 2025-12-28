import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { PrismaAdapter } from '$adapters';
import { AuthRepository } from './auth.repository';

import type { RefreshToken, User } from '@monorepo/database/client';

describe('AuthRepository', () => {
  let repository: AuthRepository;
  let mockPrismaAdapter: any;

  const mockUser: User = {
    id: 2,
    publicId: 'test-public-id',
    email: 'test@gmail.com',
    username: 'testuser',
    bio: null,
    image: null,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  beforeEach(async () => {
    mockPrismaAdapter = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      account: {
        findUnique: vi.fn(),
      },
      refreshToken: {
        create: vi.fn(),
        findUnique: vi.fn(),
        deleteMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        {
          provide: PrismaAdapter,
          useValue: mockPrismaAdapter,
        },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockPrismaAdapter.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.getUserById(1);

      expect(mockPrismaAdapter.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockPrismaAdapter.user.findUnique.mockResolvedValue(null);

      const result = await repository.getUserById(999);

      expect(mockPrismaAdapter.user.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });
  });

  describe('getUserByProvider', () => {
    it('should use account relation and return user when found', async () => {
      mockPrismaAdapter.account.findUnique.mockResolvedValue({ user: mockUser });

      const result = await repository.getUserByProvider('google', 'google_123');

      expect(mockPrismaAdapter.account.findUnique).toHaveBeenCalledWith({
        where: { provider_sub: { provider: 'google', sub: 'google_123' } },
        include: { user: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when account found but user is null', async () => {
      mockPrismaAdapter.account.findUnique.mockResolvedValue({ user: null });

      const result = await repository.getUserByProvider('google', 'google_123');

      expect(result).toBeNull();
    });

    it('should return null when not found', async () => {
      mockPrismaAdapter.account.findUnique.mockResolvedValue(null);

      const result = await repository.getUserByProvider('google', 'non_existent_id');
      expect(result).toBeNull();
    });
  });

  describe('findUserByProvider', () => {
    it('should delegate to getUserByProvider', async () => {
      mockPrismaAdapter.account.findUnique.mockResolvedValue({ user: mockUser });

      const result = await repository.findUserByProvider('google', 'google_123');

      expect(result).toEqual(mockUser);
    });
  });

  describe('createUser', () => {
    it('should create a new user with OAuth account', async () => {
      mockPrismaAdapter.user.create.mockResolvedValue(mockUser);

      const result = await repository.createUser('google', 'sub123', 'test@gmail.com', 'testuser');

      expect(mockPrismaAdapter.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          publicId: expect.any(String),
          email: 'test@gmail.com',
          username: 'testuser',
          accounts: {
            create: { provider: 'google', sub: 'sub123', email: 'test@gmail.com' },
          },
        }),
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('isUsernameTaken', () => {
    it('should return true when username exists', async () => {
      mockPrismaAdapter.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.isUsernameTaken('testuser');

      expect(result).toBe(true);
    });

    it('should return false when username does not exist', async () => {
      mockPrismaAdapter.user.findUnique.mockResolvedValue(null);

      const result = await repository.isUsernameTaken('newuser');

      expect(result).toBe(false);
    });
  });

  describe('findUserByEmail', () => {
    it('should return user when found by email', async () => {
      mockPrismaAdapter.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findUserByEmail('test@gmail.com');

      expect(mockPrismaAdapter.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@gmail.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      mockPrismaAdapter.user.findUnique.mockResolvedValue(null);

      const result = await repository.findUserByEmail('notfound@gmail.com');

      expect(mockPrismaAdapter.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'notfound@gmail.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('createRefreshToken', () => {
    it('should create a new refresh token', async () => {
      const mockRefreshToken: RefreshToken = {
        id: 1,
        token: 'refresh-token-123',
        userId: 1,
        expiresAt: new Date('2024-12-31'),
        createdAt: new Date(),
      };

      const expiresAt = new Date('2024-12-31');
      mockPrismaAdapter.refreshToken.create.mockResolvedValue(mockRefreshToken);

      const result = await repository.createRefreshToken(1, 'refresh-token-123', expiresAt);

      expect(mockPrismaAdapter.refreshToken.create).toHaveBeenCalledWith({
        data: {
          token: 'refresh-token-123',
          userId: 1,
          expiresAt,
        },
      });
      expect(result).toEqual(mockRefreshToken);
    });
  });

  describe('findRefreshToken', () => {
    it('should return refresh token with user when found', async () => {
      const mockRefreshTokenWithUser = {
        id: 1,
        token: 'refresh-token-123',
        userId: 1,
        expiresAt: new Date('2024-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser,
      };

      mockPrismaAdapter.refreshToken.findUnique.mockResolvedValue(mockRefreshTokenWithUser);

      const result = await repository.findRefreshToken('refresh-token-123');

      expect(mockPrismaAdapter.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'refresh-token-123' },
        include: { user: true },
      });
      expect(result).toEqual(mockRefreshTokenWithUser);
    });

    it('should return null when refresh token not found', async () => {
      mockPrismaAdapter.refreshToken.findUnique.mockResolvedValue(null);

      const result = await repository.findRefreshToken('non-existent-token');

      expect(mockPrismaAdapter.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'non-existent-token' },
        include: { user: true },
      });
      expect(result).toBeNull();
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete refresh token by token string', async () => {
      mockPrismaAdapter.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await repository.deleteRefreshToken('refresh-token-123');

      expect(mockPrismaAdapter.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'refresh-token-123' },
      });
    });
  });

  describe('deleteAllRefreshTokens', () => {
    it('should delete all refresh tokens for a user', async () => {
      mockPrismaAdapter.refreshToken.deleteMany.mockResolvedValue({ count: 3 });

      await repository.deleteAllRefreshTokens(1);

      expect(mockPrismaAdapter.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });
  });

  describe('deleteExpiredRefreshTokens', () => {
    it('should delete expired refresh tokens', async () => {
      mockPrismaAdapter.refreshToken.deleteMany.mockResolvedValue({ count: 5 });

      await repository.deleteExpiredRefreshTokens();

      expect(mockPrismaAdapter.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });
});
