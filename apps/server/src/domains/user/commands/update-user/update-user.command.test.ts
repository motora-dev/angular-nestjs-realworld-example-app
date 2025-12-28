import { Command } from '@nestjs/cqrs';

import type { UpdateUserRequestDto, UserResponseDto } from '$domains/user/contracts';
import { UpdateUserCommand } from './update-user.command';

describe('UpdateUserCommand', () => {
  const mockRequest: UpdateUserRequestDto = {
    user: {
      email: 'newemail@example.com',
      username: 'newusername',
      bio: 'New bio',
      image: 'https://example.com/new-image.jpg',
    },
  };

  it('should create an UpdateUserCommand with correct properties and extend Command', () => {
    const userId = 1;
    const command = new UpdateUserCommand(userId, mockRequest);

    expect(command).toBeInstanceOf(UpdateUserCommand);
    expect(command).toBeInstanceOf(Command<UserResponseDto>);
    expect(command.userId).toBe(userId);
    expect(command.request).toEqual(mockRequest);
  });

  it('should set userId property correctly', () => {
    const userId = 2;
    const command = new UpdateUserCommand(userId, mockRequest);

    expect(command.userId).toBe(userId);
  });

  it('should set request property correctly', () => {
    const userId = 1;
    const command = new UpdateUserCommand(userId, mockRequest);

    expect(command.request).toEqual(mockRequest);
  });
});
