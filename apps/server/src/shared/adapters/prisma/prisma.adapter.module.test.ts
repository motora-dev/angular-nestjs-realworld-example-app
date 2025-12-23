import { Test, TestingModule } from '@nestjs/testing';

import { PrismaAdapter } from './prisma.adapter';
import { PrismaAdapterModule } from './prisma.adapter.module';

describe('PrismaAdapterModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaAdapterModule],
    }).compile();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  describe('Module Structure', () => {
    it('should provide PrismaAdapter', () => {
      const providers = Reflect.getMetadata('providers', PrismaAdapterModule);
      expect(providers).toContain(PrismaAdapter);
    });

    it('should export PrismaAdapter', () => {
      const exports = Reflect.getMetadata('exports', PrismaAdapterModule);
      expect(exports).toContain(PrismaAdapter);
    });
  });

  describe('Dependencies', () => {
    it('should resolve PrismaAdapter', () => {
      const adapter = module.get<PrismaAdapter>(PrismaAdapter);
      expect(adapter).toBeDefined();
      expect(adapter.$connect).toBeDefined();
      expect(adapter.$disconnect).toBeDefined();
    });

    it('should provide singleton instance of PrismaAdapter', () => {
      const adapter1 = module.get<PrismaAdapter>(PrismaAdapter);
      const adapter2 = module.get<PrismaAdapter>(PrismaAdapter);
      expect(adapter1).toBe(adapter2);
    });
  });
});
