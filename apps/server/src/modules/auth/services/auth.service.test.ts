import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { AuthRepository } from '../repositories/auth.repository';

describe('AuthService', () => {
  let service: AuthService;
  let mockAuthRepository: any;
  let mockConfigService: any;

  const mockUser = {
    id: 2,
    email: 'test@gmail.com',
    publicId: 'public-id',
    username: 'testuser',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(async () => {
    mockAuthRepository = {
      findUserByProvider: vi.fn(),
      findUserByEmail: vi.fn(),
      isUsernameTaken: vi.fn(),
      createUser: vi.fn(),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'JWT_PRIVATE_KEY') return 'mock-private-key';
        if (key === 'JWT_PUBLIC_KEY') return 'mock-public-key';
        if (key === 'NODE_ENV') return 'test';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUser', () => {
    it('should delegate to repository', async () => {
      mockAuthRepository.findUserByProvider.mockResolvedValue(mockUser);
      const result = await service.findUser('google', 'test-google-id');
      expect(mockAuthRepository.findUserByProvider).toHaveBeenCalledWith('google', 'test-google-id');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockAuthRepository.findUserByProvider.mockResolvedValue(null);
      const result = await service.findUser('google', 'non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('registerUser', () => {
    it('should delegate to repository', async () => {
      mockAuthRepository.createUser.mockResolvedValue(mockUser);
      const result = await service.registerUser('google', 'sub123', 'test@gmail.com', 'testuser');
      expect(mockAuthRepository.createUser).toHaveBeenCalledWith('google', 'sub123', 'test@gmail.com', 'testuser');
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors', async () => {
      const error = new Error('Database error');
      mockAuthRepository.createUser.mockRejectedValue(error);
      await expect(service.registerUser('google', 'sub123', 'test@gmail.com', 'testuser')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('isUsernameTaken', () => {
    it('should return true when username is taken', async () => {
      mockAuthRepository.isUsernameTaken.mockResolvedValue(true);
      const result = await service.isUsernameTaken('testuser');
      expect(result).toBe(true);
    });

    it('should return false when username is available', async () => {
      mockAuthRepository.isUsernameTaken.mockResolvedValue(false);
      const result = await service.isUsernameTaken('newuser');
      expect(result).toBe(false);
    });
  });
});
