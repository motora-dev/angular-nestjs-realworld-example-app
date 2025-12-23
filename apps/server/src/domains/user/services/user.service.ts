import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { UserRepository, UserWithAccount } from '../repositories/user.repository';

import type { CreateUserDto, CreateUserResponseDto, UpdateUserRequestDto, UserDto, UserResponseDto } from '../dto';

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  /**
   * Get current user
   */
  async getCurrentUser(userId: number): Promise<UserResponseDto> {
    const user = await this.repository.getById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user: this.mapUserToDto(user) };
  }

  /**
   * Update current user
   */
  async updateUser(userId: number, request: UpdateUserRequestDto): Promise<UserResponseDto> {
    const existingUser = await this.repository.getById(userId);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check username uniqueness
    if (request.user.username) {
      const isTaken = await this.repository.isUsernameTaken(request.user.username, userId);
      if (isTaken) {
        throw new ConflictException('Username is already taken');
      }
    }

    // Check email uniqueness
    if (request.user.email) {
      const isTaken = await this.repository.isEmailTaken(request.user.email, userId);
      if (isTaken) {
        throw new ConflictException('Email is already taken');
      }
    }

    const user = await this.repository.update(userId, {
      email: request.user.email,
      username: request.user.username,
      bio: request.user.bio,
      image: request.user.image,
    });

    return { user: this.mapUserToDto(user) };
  }

  /**
   * Get or create user by OAuth account
   */
  async getOrCreateUser(provider: string, providerId: string): Promise<UserResponseDto | null> {
    const user = await this.repository.getByOAuthAccount(provider, providerId);

    if (!user) {
      return null;
    }

    return { user: this.mapUserToDto(user) };
  }

  /**
   * Create user (OAuth flow)
   */
  async createUser(dto: CreateUserDto): Promise<CreateUserResponseDto> {
    // Check username uniqueness
    const isTaken = await this.repository.isUsernameTaken(dto.username);
    if (isTaken) {
      throw new ConflictException('Username is already taken');
    }

    const user = await this.repository.create({
      provider: dto.provider,
      providerId: dto.providerId,
      email: dto.email,
      username: dto.username,
      image: dto.image,
    });

    return { user: this.mapUserToDto(user) };
  }

  /**
   * Map database user to DTO
   */
  private mapUserToDto(user: UserWithAccount): UserDto {
    return {
      email: user.email,
      username: user.username,
      bio: user.bio,
      image: user.image,
    };
  }
}
