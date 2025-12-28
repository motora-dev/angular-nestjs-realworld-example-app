import { Command } from '@nestjs/cqrs';

import type { CreateUserDto, CreateUserResponseDto } from '$domains/user/contracts';
import { CreateUserCommand } from './create-user.command';

describe('CreateUserCommand', () => {
  const mockDto: CreateUserDto = {
    provider: 'google',
    providerId: '123456789',
    email: 'test@example.com',
    username: 'testuser',
    image: 'https://example.com/image.jpg',
  };

  it('should create a CreateUserCommand with correct properties and extend Command', () => {
    const command = new CreateUserCommand(mockDto);

    expect(command).toBeInstanceOf(CreateUserCommand);
    expect(command).toBeInstanceOf(Command<CreateUserResponseDto>);
    expect(command.dto).toEqual(mockDto);
  });

  it('should set dto property correctly', () => {
    const command = new CreateUserCommand(mockDto);

    expect(command.dto).toEqual(mockDto);
  });
});
