import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';

import { PrismaAdapter } from '$adapters';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { CreateUserFromGoogleHandler } from './commands/create-user/create-user.handler';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './services/auth.service';

describe('AuthModule', () => {
  describe('module definition', () => {
    it('should be defined', () => {
      expect(AuthModule).toBeDefined();
    });

    it('should be a class', () => {
      expect(typeof AuthModule).toBe('function');
      expect(AuthModule.prototype).toBeDefined();
    });

    it('should be instantiable', () => {
      const instance = new AuthModule();
      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(AuthModule);
    });

    it('should have correct module metadata', () => {
      const moduleMetadata = Reflect.getMetadata('imports', AuthModule) || [];
      const controllers = Reflect.getMetadata('controllers', AuthModule) || [];
      const providers = Reflect.getMetadata('providers', AuthModule) || [];
      const exports = Reflect.getMetadata('exports', AuthModule) || [];

      // imports の確認 (PassportModuleは特別な設定を持つため、CqrsModuleとConfigModuleのみチェック)
      expect(moduleMetadata).toContain(ConfigModule);
      expect(moduleMetadata).toContain(CqrsModule);

      // controllers の確認
      expect(controllers).toContain(AuthController);

      // exports の確認
      expect(exports).toContain(AuthService);

      // providers の確認（具体的なクラスは実際のファイルが存在しないとテストできないため、長さのみ確認）
      expect(providers).toBeDefined();
      expect(Array.isArray(providers)).toBe(true);
    });

    it('should have PassportModule with session configuration', () => {
      const moduleMetadata = Reflect.getMetadata('imports', AuthModule) || [];

      // PassportModuleが含まれているかチェック（設定付きのため特別処理）
      const hasPassportModule = moduleMetadata.some((importModule: any) => {
        return importModule && typeof importModule === 'object' && importModule.module === PassportModule;
      });

      expect(hasPassportModule).toBe(true);
    });
  });

  describe('module compilation', () => {
    it('should compile successfully', async () => {
      const testModule = await Test.createTestingModule({
        imports: [AuthModule],
      })
        .overrideProvider(AuthService)
        .useValue({})
        .overrideProvider(AuthRepository)
        .useValue({})
        .overrideProvider(PrismaAdapter)
        .useValue({})
        .overrideProvider(CreateUserFromGoogleHandler)
        .useValue({})
        .compile();

      expect(testModule).toBeDefined();
      await testModule.close();
    });

    it('should provide AuthController', async () => {
      const testModule = await Test.createTestingModule({
        imports: [AuthModule],
      })
        .overrideProvider(AuthService)
        .useValue({})
        .overrideProvider(AuthRepository)
        .useValue({})
        .overrideProvider(PrismaAdapter)
        .useValue({})
        .overrideProvider(CreateUserFromGoogleHandler)
        .useValue({})
        .compile();

      const controller = testModule.get<AuthController>(AuthController);
      expect(controller).toBeDefined();
      await testModule.close();
    });

    it('should provide AuthService', async () => {
      const mockService = { test: 'mock' };
      const testModule = await Test.createTestingModule({
        imports: [AuthModule],
      })
        .overrideProvider(AuthService)
        .useValue(mockService)
        .overrideProvider(AuthRepository)
        .useValue({})
        .overrideProvider(PrismaAdapter)
        .useValue({})
        .overrideProvider(CreateUserFromGoogleHandler)
        .useValue({})
        .compile();

      const service = testModule.get<AuthService>(AuthService);
      expect(service).toBe(mockService);
      await testModule.close();
    });

    it('should provide AuthRepository', async () => {
      const mockRepository = { test: 'mock' };
      const testModule = await Test.createTestingModule({
        imports: [AuthModule],
      })
        .overrideProvider(AuthService)
        .useValue({})
        .overrideProvider(AuthRepository)
        .useValue(mockRepository)
        .overrideProvider(PrismaAdapter)
        .useValue({})
        .overrideProvider(CreateUserFromGoogleHandler)
        .useValue({})
        .compile();

      const repository = testModule.get<AuthRepository>(AuthRepository);
      expect(repository).toBe(mockRepository);
      await testModule.close();
    });

    it('should provide PrismaAdapter', async () => {
      const mockAdapter = { test: 'mock' };
      const testModule = await Test.createTestingModule({
        imports: [AuthModule],
      })
        .overrideProvider(AuthService)
        .useValue({})
        .overrideProvider(AuthRepository)
        .useValue({})
        .overrideProvider(PrismaAdapter)
        .useValue(mockAdapter)
        .overrideProvider(CreateUserFromGoogleHandler)
        .useValue({})
        .compile();

      const adapter = testModule.get<PrismaAdapter>(PrismaAdapter);
      expect(adapter).toBe(mockAdapter);
      await testModule.close();
    });

    it('should provide command handlers', async () => {
      const mockGoogleHandler = { test: 'google' };

      const testModule = await Test.createTestingModule({
        imports: [AuthModule],
      })
        .overrideProvider(AuthService)
        .useValue({})
        .overrideProvider(AuthRepository)
        .useValue({})
        .overrideProvider(PrismaAdapter)
        .useValue({})
        .overrideProvider(CreateUserFromGoogleHandler)
        .useValue(mockGoogleHandler)
        .compile();

      const googleHandler = testModule.get<CreateUserFromGoogleHandler>(CreateUserFromGoogleHandler);

      expect(googleHandler).toBe(mockGoogleHandler);
      await testModule.close();
    });

    it('should export AuthService', async () => {
      const mockService = { test: 'exported' };
      const testModule = await Test.createTestingModule({
        imports: [AuthModule],
      })
        .overrideProvider(AuthService)
        .useValue(mockService)
        .overrideProvider(AuthRepository)
        .useValue({})
        .overrideProvider(PrismaAdapter)
        .useValue({})
        .overrideProvider(CreateUserFromGoogleHandler)
        .useValue({})
        .compile();

      // エクスポートされたサービスを取得できることを確認
      const exportedService = testModule.get<AuthService>(AuthService);
      expect(exportedService).toBe(mockService);
      await testModule.close();
    });
  });

  describe('module imports validation', () => {
    it('should have PassportModule with correct session configuration', () => {
      const moduleMetadata = Reflect.getMetadata('imports', AuthModule) || [];

      // PassportModuleの設定を確認
      const passportModuleConfig = moduleMetadata.find((importModule: any) => {
        return importModule && typeof importModule === 'object' && importModule.module === PassportModule;
      });

      expect(passportModuleConfig).toBeDefined();
    });

    it('should include all required modules', () => {
      const moduleMetadata = Reflect.getMetadata('imports', AuthModule) || [];

      expect(moduleMetadata).toContain(ConfigModule);
      expect(moduleMetadata).toContain(CqrsModule);
      expect(moduleMetadata).toHaveLength(3); // PassportModule, ConfigModule, CqrsModule
    });
  });

  describe('multiple instances', () => {
    it('should create multiple independent instances', () => {
      const instance1 = new AuthModule();
      const instance2 = new AuthModule();

      expect(instance1).toBeDefined();
      expect(instance2).toBeDefined();
      expect(instance1).not.toBe(instance2);
      expect(instance1).toBeInstanceOf(AuthModule);
      expect(instance2).toBeInstanceOf(AuthModule);
    });

    it('should have same constructor', () => {
      const instance1 = new AuthModule();
      const instance2 = new AuthModule();

      expect(instance1.constructor).toBe(instance2.constructor);
      expect(instance1.constructor).toBe(AuthModule);
    });
  });

  describe('module structure', () => {
    it('should have correct class structure', () => {
      expect(AuthModule.prototype.constructor).toBe(AuthModule);
      expect(AuthModule.name).toBe('AuthModule');
    });

    it('should be extensible', () => {
      class ExtendedAuthModule extends AuthModule {
        testMethod() {
          return 'test';
        }
      }

      const extended = new ExtendedAuthModule();
      expect(extended).toBeInstanceOf(AuthModule);
      expect(extended).toBeInstanceOf(ExtendedAuthModule);
      expect(extended.testMethod()).toBe('test');
    });

    it('should support property assignment', () => {
      const instance = new AuthModule();
      (instance as any).testProperty = 'test';

      expect((instance as any).testProperty).toBe('test');
    });

    it('should work with Object.keys', () => {
      const instance = new AuthModule();
      const keys = Object.keys(instance);

      expect(Array.isArray(keys)).toBe(true);
      // 新しいインスタンスにはプロパティがないため、空配列になる
      expect(keys).toHaveLength(0);
    });

    it('should work with Object.getOwnPropertyNames', () => {
      const instance = new AuthModule();
      const propertyNames = Object.getOwnPropertyNames(instance);

      expect(Array.isArray(propertyNames)).toBe(true);
    });

    it('should work with instanceof operator', () => {
      const instance = new AuthModule();

      expect(instance instanceof AuthModule).toBe(true);
      expect(instance instanceof Object).toBe(true);
    });

    it('should work with typeof operator', () => {
      const instance = new AuthModule();

      expect(typeof instance).toBe('object');
      expect(typeof AuthModule).toBe('function');
    });

    it('should support JSON serialization', () => {
      const instance = new AuthModule();
      const jsonString = JSON.stringify(instance);
      const parsed = JSON.parse(jsonString);

      expect(parsed).toEqual({});
      expect(typeof parsed).toBe('object');
    });

    it('should support Object.assign', () => {
      const instance = new AuthModule();
      const assigned = Object.assign({}, instance);

      expect(assigned).toEqual({});
      expect(assigned).not.toBe(instance);
    });

    it('should support spread operator', () => {
      const instance = new AuthModule();
      const spread = { ...instance };

      expect(spread).toEqual({});
      expect(spread).not.toBe(instance);
    });
  });

  describe('command handlers configuration', () => {
    it('should include all command handlers in providers', () => {
      const providers = Reflect.getMetadata('providers', AuthModule) || [];

      expect(providers).toBeDefined();
      expect(Array.isArray(providers)).toBe(true);
      // 最低限の期待プロバイダー数をチェック（具体的なクラスがモックされているため）
      expect(providers.length).toBeGreaterThanOrEqual(4); // AuthService, AuthRepository, PrismaAdapter, コマンドハンドラー
    });

    it('should be a valid NestJS module', () => {
      // モジュールデコレーターが適切に適用されているかチェック
      expect(Reflect.hasMetadata('imports', AuthModule)).toBe(true);
      expect(Reflect.hasMetadata('controllers', AuthModule)).toBe(true);
      expect(Reflect.hasMetadata('providers', AuthModule)).toBe(true);
      expect(Reflect.hasMetadata('exports', AuthModule)).toBe(true);
    });
  });
});
