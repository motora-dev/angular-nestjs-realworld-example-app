import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapterModule } from '$adapters';
import { FollowUserHandler, UnfollowUserHandler } from './commands';
import { ProfileController } from './profile.controller';
import { GetProfileHandler } from './queries';
import { ProfileRepository } from './repositories';
import { ProfileService } from './services';

const CommandHandlers = [FollowUserHandler, UnfollowUserHandler];
const QueryHandlers = [GetProfileHandler];

@Module({
  imports: [CqrsModule, PrismaAdapterModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository, ...CommandHandlers, ...QueryHandlers],
})
export class ProfileModule {}
