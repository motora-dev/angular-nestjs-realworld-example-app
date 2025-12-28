import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { PrismaAdapter } from '$adapters';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockPrismaAdapter: any;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    bio: 'Test bio',
    image: 'https://example.com/image.jpg',
  };

  beforeEach(async () => {
    mockPrismaAdapter = {
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      account: {
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaAdapter,
          useValue: mockPrismaAdapter,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      const id = 1;

      mockPrismaAdapter.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.getById(id);

      expect(result).toEqual(mockUser);
      expect(mockPrismaAdapter.user.findUnique).toHaveBeenCalledWith({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          bio: true,
          image: true,
        },
      });
    });

    it('should return null when user is not found', async () => {
      const id = 999;

      mockPrismaAdapter.user.findUnique.mockResolvedValue(null);

      const result = await repository.getById(id);

      expect(result).toBeNull();
    });
  });

  describe('getByUsername', () => {
    it('should return user by username', async () => {
      const username = 'testuser';

      mockPrismaAdapter.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.getByUsername(username);

      expect(result).toEqual(mockUser);
      expect(mockPrismaAdapter.user.findUnique).toHaveBeenCalledWith({
        where: { username },
        select: {
          id: true,
          email: true,
          username: true,
          bio: true,
          image: true,
        },
      });
    });

    it('should return null when user is not found', async () => {
      const username = 'nonexistent';

      mockPrismaAdapter.user.findUnique.mockResolvedValue(null);

      const result = await repository.getByUsername(username);

      expect(result).toBeNull();
    });
  });

  describe('getByOAuthAccount', () => {
    it('should return user by OAuth account', async () => {
      const provider = 'google';
      const providerId = '123456789';

      mockPrismaAdapter.account.findUnique.mockResolvedValue({
        user: mockUser,
      });

      const result = await repository.getByOAuthAccount(provider, providerId);

      expect(result).toEqual(mockUser);
      expect(mockPrismaAdapter.account.findUnique).toHaveBeenCalledWith({
        where: {
          provider_sub: {
            provider,
            sub: providerId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              bio: true,
              image: true,
            },
          },
        },
      });
    });

    it('should return null when account is not found', async () => {
      const provider = 'google';
      const providerId = '123456789';

      mockPrismaAdapter.account.findUnique.mockResolvedValue(null);

      const result = await repository.getByOAuthAccount(provider, providerId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create user with OAuth account', async () => {
      const params = {
        provider: 'google',
        providerId: '123456789',
        email: 'test@example.com',
        username: 'testuser',
        image: 'https://example.com/image.jpg',
      };

      mockPrismaAdapter.user.create.mockResolvedValue(mockUser);

      const result = await repository.create(params);

      expect(result).toEqual(mockUser);
      expect(mockPrismaAdapter.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: params.email,
            username: params.username,
            image: params.image,
            accounts: {
              create: {
                provider: params.provider,
                sub: params.providerId,
                email: params.email,
              },
            },
          }),
          select: {
            id: true,
            email: true,
            username: true,
            bio: true,
            image: true,
          },
        }),
      );
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const id = 1;
      const params = {
        email: 'newemail@example.com',
        username: 'newusername',
        bio: 'New bio',
        image: 'https://example.com/new-image.jpg',
      };

      mockPrismaAdapter.user.update.mockResolvedValue({
        ...mockUser,
        ...params,
      });

      const result = await repository.update(id, params);

      expect(result).toEqual({ ...mockUser, ...params });
      expect(mockPrismaAdapter.user.update).toHaveBeenCalledWith({
        where: { id },
        data: params,
        select: {
          id: true,
          email: true,
          username: true,
          bio: true,
          image: true,
        },
      });
    });
  });

  describe('isUsernameTaken', () => {
    it('should return true when username is taken', async () => {
      const username = 'takenusername';

      mockPrismaAdapter.user.findFirst.mockResolvedValue(mockUser);

      const result = await repository.isUsernameTaken(username);

      expect(result).toBe(true);
      expect(mockPrismaAdapter.user.findFirst).toHaveBeenCalledWith({
        where: { username },
      });
    });

    it('should return false when username is not taken', async () => {
      const username = 'availableusername';

      mockPrismaAdapter.user.findFirst.mockResolvedValue(null);

      const result = await repository.isUsernameTaken(username);

      expect(result).toBe(false);
    });

    it('should exclude current user when checking', async () => {
      const username = 'testuser';
      const excludeUserId = 1;

      mockPrismaAdapter.user.findFirst.mockResolvedValue(null);

      await repository.isUsernameTaken(username, excludeUserId);

      expect(mockPrismaAdapter.user.findFirst).toHaveBeenCalledWith({
        where: {
          username,
          id: { not: excludeUserId },
        },
      });
    });
  });

  describe('isEmailTaken', () => {
    it('should return true when email is taken', async () => {
      const email = 'taken@example.com';

      mockPrismaAdapter.user.findFirst.mockResolvedValue(mockUser);

      const result = await repository.isEmailTaken(email);

      expect(result).toBe(true);
      expect(mockPrismaAdapter.user.findFirst).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return false when email is not taken', async () => {
      const email = 'available@example.com';

      mockPrismaAdapter.user.findFirst.mockResolvedValue(null);

      const result = await repository.isEmailTaken(email);

      expect(result).toBe(false);
    });

    it('should exclude current user when checking', async () => {
      const email = 'test@example.com';
      const excludeUserId = 1;

      mockPrismaAdapter.user.findFirst.mockResolvedValue(null);

      await repository.isEmailTaken(email, excludeUserId);

      expect(mockPrismaAdapter.user.findFirst).toHaveBeenCalledWith({
        where: {
          email,
          id: { not: excludeUserId },
        },
      });
    });
  });
});
