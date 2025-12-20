import { Injectable, NotFoundException } from "@nestjs/common";

import { UserRepository } from "$domains/user/repositories";

import type { User } from "@monorepo/database/client";

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserByProvider(provider: string, sub: string): Promise<User> {
    const user = await this.userRepository.getUserByProvider(provider, sub);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async findOrCreateUser(
    provider: string,
    sub: string,
    email: string
  ): Promise<User> {
    const existUser = await this.userRepository.getUserByProvider(
      provider,
      sub
    );
    if (existUser) {
      return existUser;
    }
    return await this.userRepository.findOrCreateUser(provider, sub, email);
  }
}
