import { Command } from '@nestjs/cqrs';

import type { ProfileResponseDto } from '$domains/profile/contracts';
import { UnfollowUserCommand } from './unfollow-user.command';

describe('UnfollowUserCommand', () => {
  it('should create an UnfollowUserCommand with correct properties and extend Command', () => {
    const username = 'testuser';
    const currentUserId = 1;
    const command = new UnfollowUserCommand(username, currentUserId);

    expect(command).toBeInstanceOf(UnfollowUserCommand);
    expect(command).toBeInstanceOf(Command<ProfileResponseDto>);
    expect(command.username).toBe(username);
    expect(command.currentUserId).toBe(currentUserId);
  });

  it('should set username property correctly', () => {
    const username = 'specific-username';
    const currentUserId = 1;
    const command = new UnfollowUserCommand(username, currentUserId);

    expect(command.username).toBe(username);
  });

  it('should set currentUserId property correctly', () => {
    const username = 'testuser';
    const currentUserId = 2;
    const command = new UnfollowUserCommand(username, currentUserId);

    expect(command.currentUserId).toBe(currentUserId);
  });
});
