import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { PrismaAdapter } from './prisma.adapter';

describe('PrismaAdapter', () => {
  let adapter: PrismaAdapter;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      $connect: vi.fn(),
      $disconnect: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaAdapter,
          useFactory: () => {
            return Object.assign(prismaMock, {
              onModuleInit: PrismaAdapter.prototype.onModuleInit,
              onModuleDestroy: PrismaAdapter.prototype.onModuleDestroy,
            });
          },
        },
      ],
    }).compile();

    adapter = module.get<PrismaAdapter>(PrismaAdapter);
  });

  describe('lifecycle hooks', () => {
    it('should connect on module init', async () => {
      await adapter.onModuleInit();
      expect(prismaMock.$connect).toHaveBeenCalledTimes(1);
    });

    it('should disconnect on module destroy', async () => {
      await adapter.onModuleDestroy();
      expect(prismaMock.$disconnect).toHaveBeenCalledTimes(1);
    });

    it('should handle connection error', async () => {
      const error = new Error('Connection failed');
      prismaMock.$connect.mockRejectedValueOnce(error);

      await expect(adapter.onModuleInit()).rejects.toThrow(error);
    });

    it('should handle disconnection error', async () => {
      const error = new Error('Disconnection failed');
      prismaMock.$disconnect.mockRejectedValueOnce(error);

      await expect(adapter.onModuleDestroy()).rejects.toThrow(error);
    });
  });

  describe('prisma client methods', () => {
    it('should have prisma client methods', () => {
      expect(adapter.$connect).toBeDefined();
      expect(adapter.$disconnect).toBeDefined();
    });
  });
});
