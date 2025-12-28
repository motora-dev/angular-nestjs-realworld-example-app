import { Command } from '@nestjs/cqrs';

import { ProcessOAuthCallbackCommand, type ProcessOAuthCallbackResult } from './process-oauth-callback.command';

describe('ProcessOAuthCallbackCommand', () => {
  it('should create a ProcessOAuthCallbackCommand with correct properties and extend Command', () => {
    const provider = 'google';
    const sub = '123456789';
    const email = 'test@example.com';
    const command = new ProcessOAuthCallbackCommand(provider, sub, email);

    expect(command).toBeInstanceOf(ProcessOAuthCallbackCommand);
    expect(command).toBeInstanceOf(Command<ProcessOAuthCallbackResult>);
    expect(command.provider).toBe(provider);
    expect(command.sub).toBe(sub);
    expect(command.email).toBe(email);
  });

  it('should set properties correctly', () => {
    const provider = 'github';
    const sub = '987654321';
    const email = 'another@example.com';
    const command = new ProcessOAuthCallbackCommand(provider, sub, email);

    expect(command.provider).toBe(provider);
    expect(command.sub).toBe(sub);
    expect(command.email).toBe(email);
  });
});
