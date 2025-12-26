import { Test, TestingModule } from '@nestjs/testing';

import { PrismaAdapter } from '$adapters';
import { AuthRepository } from './auth.repository';

import type { User } from '@monorepo/database/client';

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
});
