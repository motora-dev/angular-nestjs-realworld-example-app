import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { PrismaAdapter } from '$adapters';
import { ProfileRepository } from './profile.repository';

describe('ProfileRepository', () => {
  let repository: ProfileRepository;
  let mockPrismaAdapter: any;

  const mockUser = {
    id: 1,
    username: 'testuser',
    bio: 'Test bio',
    image: 'https://example.com/image.jpg',
  };

  beforeEach(async () => {
    mockPrismaAdapter = {
      user: {
        findUnique: vi.fn(),
      },
      follow: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        deleteMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileRepository,
        {
          provide: PrismaAdapter,
          useValue: mockPrismaAdapter,
        },
      ],
    }).compile();

    repository = module.get<ProfileRepository>(ProfileRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getByUsername', () => {
    it('should return user profile', async () => {
      const username = 'testuser';

      mockPrismaAdapter.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.getByUsername(username);

      expect(result).toEqual(mockUser);
      expect(mockPrismaAdapter.user.findUnique).toHaveBeenCalledWith({
        where: { username },
        select: {
          id: true,
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
      expect(mockPrismaAdapter.user.findUnique).toHaveBeenCalledWith({
        where: { username },
        select: {
          id: true,
          username: true,
          bio: true,
          image: true,
        },
      });
    });
  });

  describe('isFollowing', () => {
    it('should return true when follow relationship exists', async () => {
      const followerId = 1;
      const followingId = 2;

      mockPrismaAdapter.follow.findUnique.mockResolvedValue({
        followerId,
        followingId,
      });

      const result = await repository.isFollowing(followerId, followingId);

      expect(result).toBe(true);
      expect(mockPrismaAdapter.follow.findUnique).toHaveBeenCalledWith({
        where: {
          followerId_followingId: { followerId, followingId },
        },
      });
    });

    it('should return false when follow relationship does not exist', async () => {
      const followerId = 1;
      const followingId = 2;

      mockPrismaAdapter.follow.findUnique.mockResolvedValue(null);

      const result = await repository.isFollowing(followerId, followingId);

      expect(result).toBe(false);
      expect(mockPrismaAdapter.follow.findUnique).toHaveBeenCalledWith({
        where: {
          followerId_followingId: { followerId, followingId },
        },
      });
    });
  });

  describe('follow', () => {
    it('should create follow relationship', async () => {
      const followerId = 1;
      const followingId = 2;

      mockPrismaAdapter.follow.upsert.mockResolvedValue(undefined);

      await repository.follow(followerId, followingId);

      expect(mockPrismaAdapter.follow.upsert).toHaveBeenCalledWith({
        where: {
          followerId_followingId: { followerId, followingId },
        },
        create: { followerId, followingId },
        update: {},
      });
    });
  });

  describe('unfollow', () => {
    it('should delete follow relationship', async () => {
      const followerId = 1;
      const followingId = 2;

      mockPrismaAdapter.follow.deleteMany.mockResolvedValue(undefined);

      await repository.unfollow(followerId, followingId);

      expect(mockPrismaAdapter.follow.deleteMany).toHaveBeenCalledWith({
        where: { followerId, followingId },
      });
    });
  });
});
