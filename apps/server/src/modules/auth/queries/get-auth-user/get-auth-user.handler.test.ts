import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import * as Presenters from '$modules/auth/presenters/auth.presenter';
import { GetAuthUserHandler } from './get-auth-user.handler';
import { GetAuthUserQuery } from './get-auth-user.query';

// Mock presenters
vi.mock('$modules/auth/presenters/auth.presenter', () => ({
  toUserResponse: vi.fn(),
}));

describe('GetAuthUserHandler', () => {
  let handler: GetAuthUserHandler;

  const mockPayload = {
    id: 1,
    publicId: 'test-public-id',
    username: 'testuser',
  };

  const mockUserResponse = {
    id: 'test-public-id',
    username: 'testuser',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetAuthUserHandler],
    }).compile();

    handler = module.get<GetAuthUserHandler>(GetAuthUserHandler);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle GetAuthUserQuery', async () => {
    const query = new GetAuthUserQuery(mockPayload);

    vi.mocked(Presenters.toUserResponse).mockReturnValue(mockUserResponse);

    const result = await handler.execute(query);

    expect(result).toEqual(mockUserResponse);
    expect(Presenters.toUserResponse).toHaveBeenCalledWith(mockPayload);
  });
});
