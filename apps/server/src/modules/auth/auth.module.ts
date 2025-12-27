import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaAdapter } from '$adapters';
import { AuthController } from './auth.controller';
import {
  ProcessOAuthCallbackHandler,
  RefreshAccessTokenHandler,
  RegisterUserHandler,
  RevokeRefreshTokenHandler,
} from './commands';
import { GoogleAuthGuard } from './guards';
import { GetAuthUserHandler, GetAuthUserInfoHandler, GetPendingRegistrationHandler } from './queries';
import { AuthRepository } from './repositories';
import { AuthService } from './services';

const CommandHandlers = [
  ProcessOAuthCallbackHandler,
  RefreshAccessTokenHandler,
  RegisterUserHandler,
  RevokeRefreshTokenHandler,
];

const QueryHandlers = [GetAuthUserHandler, GetAuthUserInfoHandler, GetPendingRegistrationHandler];

@Global()
@Module({
  imports: [ConfigModule, CqrsModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, PrismaAdapter, GoogleAuthGuard, ...CommandHandlers, ...QueryHandlers],
  exports: [AuthService, GoogleAuthGuard],
})
export class AuthModule {}
