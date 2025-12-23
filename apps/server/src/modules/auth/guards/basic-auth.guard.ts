import { ERROR_CODE } from '@monorepo/error-code';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UnauthorizedError } from '$errors';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      response.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
      throw new UnauthorizedError(ERROR_CODE.UNAUTHORIZED);
    }

    const base64Credentials = authHeader.slice(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    const expectedUsername = this.configService.get<string>('BASIC_AUTH_USER');
    const expectedPassword = this.configService.get<string>('BASIC_AUTH_PASSWORD');

    if (!expectedUsername || !expectedPassword) {
      throw new UnauthorizedError(ERROR_CODE.UNAUTHORIZED);
    }

    if (username !== expectedUsername || password !== expectedPassword) {
      throw new UnauthorizedError(ERROR_CODE.UNAUTHORIZED);
    }

    return true;
  }
}
