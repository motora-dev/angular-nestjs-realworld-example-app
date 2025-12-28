import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import * as Presenters from '$domains/profile/presenters/profile.presenter';
import { ProfileRepository } from '$domains/profile/repositories/profile.repository';
import { NotFoundError } from '$errors';
import { ProfileService } from './profile.service';

// Mock presenters
vi.mock('$domains/profile/presenters/profile.presenter', () => ({
  toProfileDto: vi.fn(),
}));

describe('ProfileService', () => {
  let service: ProfileService;
  let mockRepository: any;

  const mockUserProfile = {
    id: 1,
    username: 'testuser',
    bio: 'Test bio',
    image: 'https://example.com/image.jpg',
  };

  const mockProfileDto = {
    username: 'testuser',
    bio: 'Test bio',
    image: 'https://example.com/image.jpg',
    following: false,
  };

  beforeEach(async () => {
    mockRepository = {
      getByUsername: vi.fn(),
      isFollowing: vi.fn(),
      follow: vi.fn(),
      unfollow: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: ProfileRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return profile with following status', async () => {
      const username = 'testuser';
      const currentUserId = 1;

      mockRepository.getByUsername.mockResolvedValue(mockUserProfile);
      mockRepository.isFollowing.mockResolvedValue(true);
      vi.mocked(Presenters.toProfileDto).mockReturnValue({ ...mockProfileDto, following: true });

      const result = await service.getProfile(username, currentUserId);

      expect(result).toEqual({
        profile: { ...mockProfileDto, following: true },
      });
      expect(mockRepository.getByUsername).toHaveBeenCalledWith(username);
      expect(mockRepository.isFollowing).toHaveBeenCalledWith(currentUserId, mockUserProfile.id);
      expect(Presenters.toProfileDto).toHaveBeenCalledWith(mockUserProfile, true);
    });

    it('should return profile without following status when currentUserId is not provided', async () => {
      const username = 'testuser';

      mockRepository.getByUsername.mockResolvedValue(mockUserProfile);
      vi.mocked(Presenters.toProfileDto).mockReturnValue({ ...mockProfileDto, following: false });

      const result = await service.getProfile(username);

      expect(result).toEqual({
        profile: { ...mockProfileDto, following: false },
      });
      expect(mockRepository.getByUsername).toHaveBeenCalledWith(username);
      expect(mockRepository.isFollowing).not.toHaveBeenCalled();
      expect(Presenters.toProfileDto).toHaveBeenCalledWith(mockUserProfile, false);
    });

    it('should throw NotFoundError when user is not found', async () => {
      const username = 'nonexistent';

      mockRepository.getByUsername.mockResolvedValue(null);

      await expect(service.getProfile(username)).rejects.toThrow(NotFoundError);
      expect(mockRepository.getByUsername).toHaveBeenCalledWith(username);
    });
  });

  describe('followUser', () => {
    it('should follow a user and return profile', async () => {
      const username = 'testuser';
      const currentUserId = 1;

      mockRepository.getByUsername.mockResolvedValue(mockUserProfile);
      mockRepository.follow.mockResolvedValue(undefined);
      vi.mocked(Presenters.toProfileDto).mockReturnValue({ ...mockProfileDto, following: true });

      const result = await service.followUser(username, currentUserId);

      expect(result).toEqual({
        profile: { ...mockProfileDto, following: true },
      });
      expect(mockRepository.getByUsername).toHaveBeenCalledWith(username);
      expect(mockRepository.follow).toHaveBeenCalledWith(currentUserId, mockUserProfile.id);
      expect(Presenters.toProfileDto).toHaveBeenCalledWith(mockUserProfile, true);
      expect(Presenters.toProfileDto).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when user is not found', async () => {
      const username = 'nonexistent';
      const currentUserId = 1;

      mockRepository.getByUsername.mockResolvedValue(null);

      await expect(service.followUser(username, currentUserId)).rejects.toThrow(NotFoundError);
      expect(mockRepository.getByUsername).toHaveBeenCalledWith(username);
      expect(mockRepository.follow).not.toHaveBeenCalled();
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user and return profile', async () => {
      const username = 'testuser';
      const currentUserId = 1;

      mockRepository.getByUsername.mockResolvedValue(mockUserProfile);
      mockRepository.unfollow.mockResolvedValue(undefined);
      vi.mocked(Presenters.toProfileDto).mockReturnValue({ ...mockProfileDto, following: false });

      const result = await service.unfollowUser(username, currentUserId);

      expect(result).toEqual({
        profile: { ...mockProfileDto, following: false },
      });
      expect(mockRepository.getByUsername).toHaveBeenCalledWith(username);
      expect(mockRepository.unfollow).toHaveBeenCalledWith(currentUserId, mockUserProfile.id);
      expect(Presenters.toProfileDto).toHaveBeenCalledWith(mockUserProfile, false);
      expect(Presenters.toProfileDto).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when user is not found', async () => {
      const username = 'nonexistent';
      const currentUserId = 1;

      mockRepository.getByUsername.mockResolvedValue(null);

      await expect(service.unfollowUser(username, currentUserId)).rejects.toThrow(NotFoundError);
      expect(mockRepository.getByUsername).toHaveBeenCalledWith(username);
      expect(mockRepository.unfollow).not.toHaveBeenCalled();
    });
  });
});
