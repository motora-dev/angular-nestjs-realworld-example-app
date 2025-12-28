import { Command } from '@nestjs/cqrs';

import { RevokeRefreshTokenCommand } from './revoke-refresh-token.command';

describe('RevokeRefreshTokenCommand', () => {
  it('should create a RevokeRefreshTokenCommand with refreshToken and extend Command', () => {
    const refreshToken = 'test-refresh-token';
    const command = new RevokeRefreshTokenCommand(refreshToken);

    expect(command).toBeInstanceOf(RevokeRefreshTokenCommand);
    expect(command).toBeInstanceOf(Command<void>);
    expect(command.refreshToken).toBe(refreshToken);
  });

  it('should create a RevokeRefreshTokenCommand without refreshToken', () => {
    const command = new RevokeRefreshTokenCommand(undefined);

    expect(command).toBeInstanceOf(RevokeRefreshTokenCommand);
    expect(command).toBeInstanceOf(Command<void>);
    expect(command.refreshToken).toBeUndefined();
  });
});
