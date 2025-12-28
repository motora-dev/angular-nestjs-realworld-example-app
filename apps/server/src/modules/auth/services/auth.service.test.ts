import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { generateKeyPairSync } from 'crypto';
import { vi } from 'vitest';

import { AuthService } from './auth.service';
import { AuthRepository } from '../repositories/auth.repository';

// Generate RSA key pair for testing
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
const TEST_PRIVATE_KEY = privateKey.export({ type: 'pkcs1', format: 'pem' }) as string;
const TEST_PUBLIC_KEY = publicKey.export({ type: 'spki', format: 'pem' }) as string;

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
      getUserById: vi.fn(),
      isUsernameTaken: vi.fn(),
      createUser: vi.fn(),
      createRefreshToken: vi.fn(),
      findRefreshToken: vi.fn(),
      deleteRefreshToken: vi.fn(),
      deleteAllRefreshTokens: vi.fn(),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'JWT_PRIVATE_KEY') return TEST_PRIVATE_KEY;
        if (key === 'JWT_PUBLIC_KEY') return TEST_PUBLIC_KEY;
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

  describe('findUserByEmail', () => {
    it('should delegate to repository', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      const result = await service.findUserByEmail('test@gmail.com');
      expect(mockAuthRepository.findUserByEmail).toHaveBeenCalledWith('test@gmail.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(null);
      const result = await service.findUserByEmail('notfound@gmail.com');
      expect(result).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should delegate to repository', async () => {
      mockAuthRepository.getUserById.mockResolvedValue(mockUser);
      const result = await service.findUserById(1);
      expect(mockAuthRepository.getUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockAuthRepository.getUserById.mockResolvedValue(null);
      const result = await service.findUserById(999);
      expect(result).toBeNull();
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', () => {
      const token = service.generateAccessToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('generatePendingRegistrationToken', () => {
    it('should generate a valid JWT token for pending registration', () => {
      const token = service.generatePendingRegistrationToken('google', 'sub123', 'test@gmail.com');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyPendingRegistrationToken', () => {
    it('should verify and decode a valid token', () => {
      const token = service.generatePendingRegistrationToken('google', 'sub123', 'test@gmail.com');
      const payload = service.verifyPendingRegistrationToken(token);
      expect(payload).toBeDefined();
      expect(payload?.provider).toBe('google');
      expect(payload?.sub).toBe('sub123');
      expect(payload?.email).toBe('test@gmail.com');
    });

    it('should return null for invalid token', () => {
      const payload = service.verifyPendingRegistrationToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('should return null for malformed token', () => {
      const payload = service.verifyPendingRegistrationToken('not.a.valid.jwt.token');
      expect(payload).toBeNull();
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode a valid access token', () => {
      const token = service.generateAccessToken(mockUser);
      const payload = service.verifyAccessToken(token);
      expect(payload).toBeDefined();
      expect(payload?.id).toBe(mockUser.id);
      expect(payload?.publicId).toBe(mockUser.publicId);
      expect(payload?.username).toBe(mockUser.username);
    });

    it('should return null for invalid token', () => {
      const payload = service.verifyAccessToken('invalid-token');
      expect(payload).toBeNull();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate and save a refresh token', async () => {
      mockAuthRepository.createRefreshToken.mockResolvedValue({
        id: 1,
        token: 'generated-token',
        userId: 1,
        expiresAt: new Date(),
        createdAt: new Date(),
      });
      const token = await service.generateRefreshToken(1);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      expect(mockAuthRepository.createRefreshToken).toHaveBeenCalledWith(1, expect.any(String), expect.any(Date));
    });
  });

  describe('validateRefreshToken', () => {
    it('should return user when token is valid', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      mockAuthRepository.findRefreshToken.mockResolvedValue({
        id: 1,
        token: 'valid-token',
        userId: 1,
        expiresAt: futureDate,
        createdAt: new Date(),
        user: mockUser,
      });
      const user = await service.validateRefreshToken('valid-token');
      expect(user).toEqual(mockUser);
      expect(mockAuthRepository.findRefreshToken).toHaveBeenCalledWith('valid-token');
    });

    it('should return null when token not found', async () => {
      mockAuthRepository.findRefreshToken.mockResolvedValue(null);
      const user = await service.validateRefreshToken('non-existent-token');
      expect(user).toBeNull();
    });

    it('should return null and delete token when expired', async () => {
      const pastDate = new Date('2020-01-01');
      mockAuthRepository.findRefreshToken.mockResolvedValue({
        id: 1,
        token: 'expired-token',
        userId: 1,
        expiresAt: pastDate,
        createdAt: new Date(),
        user: mockUser,
      });
      const user = await service.validateRefreshToken('expired-token');
      expect(user).toBeNull();
      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith('expired-token');
    });
  });

  describe('revokeRefreshToken', () => {
    it('should delete refresh token', async () => {
      mockAuthRepository.deleteRefreshToken.mockResolvedValue(undefined);
      await service.revokeRefreshToken('token-to-revoke');
      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith('token-to-revoke');
    });
  });

  describe('revokeAllRefreshTokens', () => {
    it('should delete all refresh tokens for a user', async () => {
      mockAuthRepository.deleteAllRefreshTokens.mockResolvedValue(undefined);
      await service.revokeAllRefreshTokens(1);
      expect(mockAuthRepository.deleteAllRefreshTokens).toHaveBeenCalledWith(1);
    });
  });

  describe('getRefreshTokenExpiryMs', () => {
    it('should return refresh token expiry in milliseconds', () => {
      const expiry = service.getRefreshTokenExpiryMs();
      expect(expiry).toBe(14 * 24 * 60 * 60 * 1000); // 14 days in milliseconds
    });
  });

  describe('getAccessTokenExpiryMs', () => {
    it('should return access token expiry in milliseconds', () => {
      const expiry = service.getAccessTokenExpiryMs();
      expect(expiry).toBe(15 * 60 * 1000); // 15 minutes in milliseconds
    });
  });

  describe('onModuleInit', () => {
    it('should not throw error in non-production environment', () => {
      const testConfigService = {
        get: vi.fn((key: string) => {
          if (key === 'NODE_ENV') return 'development';
          return undefined;
        }),
      };
      expect(() => {
        const testService = new AuthService(mockAuthRepository, testConfigService as any);
        testService.onModuleInit();
      }).not.toThrow();
    });

    it('should not throw error in production when keys are configured', () => {
      const testConfigService = {
        get: vi.fn((key: string) => {
          if (key === 'NODE_ENV') return 'production';
          if (key === 'JWT_PRIVATE_KEY') return TEST_PRIVATE_KEY;
          if (key === 'JWT_PUBLIC_KEY') return TEST_PUBLIC_KEY;
          return undefined;
        }),
      };
      expect(() => {
        const testService = new AuthService(mockAuthRepository, testConfigService as any);
        testService.onModuleInit();
      }).not.toThrow();
    });

    it('should throw error in production when private key is missing', () => {
      const testConfigService = {
        get: vi.fn((key: string) => {
          if (key === 'NODE_ENV') return 'production';
          if (key === 'JWT_PUBLIC_KEY') return TEST_PUBLIC_KEY;
          return undefined;
        }),
      };
      expect(() => {
        const testService = new AuthService(mockAuthRepository, testConfigService as any);
        testService.onModuleInit();
      }).toThrow('JWT_PRIVATE_KEY and JWT_PUBLIC_KEY must be configured in production');
    });

    it('should throw error in production when public key is missing', () => {
      const testConfigService = {
        get: vi.fn((key: string) => {
          if (key === 'NODE_ENV') return 'production';
          if (key === 'JWT_PRIVATE_KEY') return TEST_PRIVATE_KEY;
          return undefined;
        }),
      };
      expect(() => {
        const testService = new AuthService(mockAuthRepository, testConfigService as any);
        testService.onModuleInit();
      }).toThrow('JWT_PRIVATE_KEY and JWT_PUBLIC_KEY must be configured in production');
    });
  });
});
