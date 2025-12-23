import { Injectable } from '@nestjs/common';

import { AuthRepository } from '../repositories/auth.repository';

import type { User } from '@monorepo/database/client';

@Injectable()
export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  /**
   * Find user by OAuth provider credentials (no auto-creation)
   */
  async findUser(provider: string, sub: string): Promise<User | null> {
    return this.authRepository.findUserByProvider(provider, sub);
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.authRepository.findUserByEmail(email);
  }

  /**
   * Check if username is already taken
   */
  async isUsernameTaken(username: string): Promise<boolean> {
    return this.authRepository.isUsernameTaken(username);
  }

  /**
   * Register a new user with OAuth account
   */
  async registerUser(provider: string, sub: string, email: string, username: string): Promise<User> {
    return this.authRepository.createUser(provider, sub, email, username);
  }
}
