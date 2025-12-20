import { Injectable } from '@nestjs/common';

import { AuthRepository } from '../repositories/auth.repository';

import type { User } from '@monorepo/database/client';

@Injectable()
export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  async findOrCreateUser(provider: string, sub: string, email: string): Promise<User> {
    return this.authRepository.findOrCreateUser(provider, sub, email);
  }
}
