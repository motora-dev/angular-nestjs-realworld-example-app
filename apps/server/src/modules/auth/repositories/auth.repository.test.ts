import { Test, TestingModule } from '@nestjs/testing';

import { PrismaAdapter } from '$adapters';
import { AuthRepository } from './auth.repository';

import type { User } from '@monorepo/database/client';

describe('AuthRepository', () => {
  let repository: AuthRepository;
  let mockPrismaAdapter: any;

  const mockUser: User = {
    id: 2,
    publicId: 'google-user-ulid',
    email: 'test@gmail.com',
    name: 'Google User',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  beforeEach(async () => {
    mockPrismaAdapter = {
      user: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      account: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
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

  describe('findOrCreateUser', () => {
    it('should link to existing user by email via account and return user', async () => {
      mockPrismaAdapter.account.findUnique.mockResolvedValue(null);
      mockPrismaAdapter.account.findFirst.mockResolvedValue({ user: mockUser, userId: mockUser.id });
      mockPrismaAdapter.account.create.mockResolvedValue({});

      const result = await repository.findOrCreateUser('google', 'sub', 'test@gmail.com');
      expect(result).toEqual(mockUser);
    });

    it('should upsert user by email when not linked yet', async () => {
      const upserted = { ...mockUser } as User;
      mockPrismaAdapter.account.findUnique.mockResolvedValue(null);
      mockPrismaAdapter.account.findFirst.mockResolvedValue(null);
      mockPrismaAdapter.user.upsert.mockResolvedValue(upserted);

      const result = await repository.findOrCreateUser('google', 'sub', 'test@gmail.com');
      expect(mockPrismaAdapter.user.upsert).toHaveBeenCalled();
      expect(result).toEqual(upserted);
    });
  });
});
