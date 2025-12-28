import { Controller, ExecutionContext, Get } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { CurrentUser, currentUserFactory, type CurrentUserType } from './current-user.decorator';

// Mock controller to test the decorator
@Controller('test')
class TestController {
  @Get()
  testMethod(@CurrentUser() user: CurrentUserType | undefined) {
    return user;
  }
}

describe('CurrentUser Decorator', () => {
  let module: TestingModule;
  let controller: TestController;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: any;
  let mockSwitchToHttp: any;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    controller = module.get<TestController>(TestController);

    mockRequest = {
      user: {
        id: 1,
        publicId: 'user-123',
        username: 'testuser',
      } as CurrentUserType,
    };

    mockSwitchToHttp = {
      getRequest: vi.fn().mockReturnValue(mockRequest),
    };

    mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue(mockSwitchToHttp),
    } as unknown as ExecutionContext;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should extract user from request', () => {
    const result = currentUserFactory(null, mockExecutionContext);

    expect(mockExecutionContext.switchToHttp).toHaveBeenCalledTimes(1);
    expect(mockSwitchToHttp.getRequest).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      id: 1,
      publicId: 'user-123',
      username: 'testuser',
    });
  });

  it('should return undefined when user is not present', () => {
    mockRequest.user = undefined;

    const result = currentUserFactory(null, mockExecutionContext);

    expect(result).toBeUndefined();
  });

  it('should return null when user is null', () => {
    mockRequest.user = null;

    const result = currentUserFactory(null, mockExecutionContext);

    expect(result).toBeNull();
  });

  it('should handle data parameter (ignored)', () => {
    const data = { some: 'data' };

    const result = currentUserFactory(data, mockExecutionContext);

    expect(result).toEqual({
      id: 1,
      publicId: 'user-123',
      username: 'testuser',
    });
  });

  it('should work with partial user object', () => {
    mockRequest.user = {
      id: 2,
      publicId: 'user-456',
    };

    const result = currentUserFactory(null, mockExecutionContext);

    expect(result).toEqual({
      id: 2,
      publicId: 'user-456',
    });
  });

  it('should be used in controller', () => {
    expect(controller).toBeDefined();
    expect(typeof controller.testMethod).toBe('function');
  });
});
