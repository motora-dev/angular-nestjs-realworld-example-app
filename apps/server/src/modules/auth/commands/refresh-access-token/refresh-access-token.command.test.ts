import { Command } from '@nestjs/cqrs';

import { RefreshAccessTokenCommand, type RefreshAccessTokenResult } from './refresh-access-token.command';

describe('RefreshAccessTokenCommand', () => {
  it('should create a RefreshAccessTokenCommand with correct properties and extend Command', () => {
    const refreshToken = 'test-refresh-token';
    const command = new RefreshAccessTokenCommand(refreshToken);

    expect(command).toBeInstanceOf(RefreshAccessTokenCommand);
    expect(command).toBeInstanceOf(Command<RefreshAccessTokenResult | null>);
    expect(command.refreshToken).toBe(refreshToken);
  });

  it('should set refreshToken property correctly', () => {
    const refreshToken = 'another-token';
    const command = new RefreshAccessTokenCommand(refreshToken);

    expect(command.refreshToken).toBe(refreshToken);
  });
});
