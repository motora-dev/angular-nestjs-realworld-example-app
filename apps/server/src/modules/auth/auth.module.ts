import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';

import { PrismaAdapter } from '$adapters';
import { AuthController } from './auth.controller';
import { CreateUserFromGoogleHandler } from './commands';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './services/auth.service';

const CommandHandlers = [CreateUserFromGoogleHandler];

@Module({
  imports: [PassportModule.register({ session: true }), ConfigModule, CqrsModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, PrismaAdapter, ...CommandHandlers],
  exports: [AuthService],
})
export class AuthModule {}
