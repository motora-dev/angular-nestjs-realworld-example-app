import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { GetPendingRegistrationQuery } from '$modules/auth/queries/get-pending-registration/get-pending-registration.query';
import { AuthService } from '$modules/auth/services/auth.service';
import { GetPendingRegistrationHandler } from './get-pending-registration.handler';

describe('GetPendingRegistrationHandler', () => {
  let handler: GetPendingRegistrationHandler;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      verifyPendingRegistrationToken: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPendingRegistrationHandler,
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<GetPendingRegistrationHandler>(GetPendingRegistrationHandler);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return null when pendingToken is undefined', async () => {
    const query = new GetPendingRegistrationQuery(undefined);

    const result = await handler.execute(query);

    expect(result).toBeNull();
    expect(mockService.verifyPendingRegistrationToken).not.toHaveBeenCalled();
  });

  it('should return null when token verification fails', async () => {
    const pendingToken = 'invalid-token';
    const query = new GetPendingRegistrationQuery(pendingToken);

    mockService.verifyPendingRegistrationToken.mockReturnValue(null);

    const result = await handler.execute(query);

    expect(result).toBeNull();
    expect(mockService.verifyPendingRegistrationToken).toHaveBeenCalledWith(pendingToken);
  });

  it('should return email when token verification succeeds', async () => {
    const pendingToken = 'valid-token';
    const query = new GetPendingRegistrationQuery(pendingToken);
    const mockPending = {
      provider: 'google',
      sub: '123456789',
      email: 'test@example.com',
    };

    mockService.verifyPendingRegistrationToken.mockReturnValue(mockPending);

    const result = await handler.execute(query);

    expect(result).toEqual({ email: 'test@example.com' });
    expect(mockService.verifyPendingRegistrationToken).toHaveBeenCalledWith(pendingToken);
  });
});
