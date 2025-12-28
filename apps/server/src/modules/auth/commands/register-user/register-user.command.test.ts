import { Command } from '@nestjs/cqrs';

import { RegisterUserCommand, type RegisterUserResult } from './register-user.command';

describe('RegisterUserCommand', () => {
  it('should create a RegisterUserCommand with correct properties and extend Command', () => {
    const pendingToken = 'test-pending-token';
    const username = 'testuser';
    const command = new RegisterUserCommand(pendingToken, username);

    expect(command).toBeInstanceOf(RegisterUserCommand);
    expect(command).toBeInstanceOf(Command<RegisterUserResult>);
    expect(command.pendingToken).toBe(pendingToken);
    expect(command.username).toBe(username);
  });

  it('should set properties correctly', () => {
    const pendingToken = 'another-token';
    const username = 'anotheruser';
    const command = new RegisterUserCommand(pendingToken, username);

    expect(command.pendingToken).toBe(pendingToken);
    expect(command.username).toBe(username);
  });
});
