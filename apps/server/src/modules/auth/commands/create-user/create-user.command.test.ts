import { ICommand } from '@nestjs/cqrs';

import { CreateUserCommand } from './create-user.command';

describe('CreateUserCommand', () => {
  describe('constructor and properties', () => {
    it('should create an instance with provider, sub and email', () => {
      const command = new CreateUserCommand('google', 'google-123', 'user@gmail.com');

      expect(command).toBeDefined();
      expect(command.provider).toBe('google');
      expect(command.sub).toBe('google-123');
      expect(command.email).toBe('user@gmail.com');
    });

    it('should handle various inputs', () => {
      const cases = [
        { provider: 'google', sub: 'g1', email: 'alice@gmail.com' },
        { provider: 'microsoft', sub: 'm2', email: 'bob@example.com' },
      ];
      for (const c of cases) {
        const command = new CreateUserCommand(c.provider, c.sub, c.email);
        expect(command.provider).toBe(c.provider);
        expect(command.sub).toBe(c.sub);
        expect(command.email).toBe(c.email);
      }
    });
  });

  describe('ICommand interface implementation', () => {
    it('should be assignable to ICommand', () => {
      const command = new CreateUserCommand('google', 'sub', 'mail@test.com');
      const i: ICommand = command;
      expect(i).toBe(command);
    });
  });

  describe('object behaviors', () => {
    it('should serialize and spread expected properties', () => {
      const command = new CreateUserCommand('google', 'sub-1', 'user@gmail.com');
      expect({ ...command }).toEqual({ provider: 'google', sub: 'sub-1', email: 'user@gmail.com' });
      expect(JSON.parse(JSON.stringify(command))).toEqual({
        provider: 'google',
        sub: 'sub-1',
        email: 'user@gmail.com',
      });
    });
  });
});
