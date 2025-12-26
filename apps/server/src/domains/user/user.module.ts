import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule } from '$adapters';
import { CreateUserHandler, UpdateUserHandler } from './commands';
import { GetCurrentUserHandler } from './queries';
import { UserRepository } from './repositories';
import { UserService } from './services';
import { UserController } from './user.controller';

const CommandHandlers = [CreateUserHandler, UpdateUserHandler];
const QueryHandlers = [GetCurrentUserHandler];

@Module({
  imports: [CqrsModule, PrismaAdapterModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, ...CommandHandlers, ...QueryHandlers],
  exports: [UserService],
})
export class UserModule {}
