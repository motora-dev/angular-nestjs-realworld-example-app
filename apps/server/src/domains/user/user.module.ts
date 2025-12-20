import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";

import { PrismaAdapterModule } from "$adapters";
import { CreateUserHandler } from "./commands";
import { GetUserHandler } from "./queries";
import { UserRepository } from "./repositories";
import { UserService } from "./services";
import { UserController } from "./user.controller";

const CommandHandlers = [CreateUserHandler];
const QueryHandlers = [GetUserHandler];

@Module({
  imports: [CqrsModule, ConfigModule, PrismaAdapterModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class UserModule {}
