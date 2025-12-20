import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      response.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
      throw new UnauthorizedException('Basic authentication required');
    }

    const base64Credentials = authHeader.slice(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    const expectedUsername = this.configService.get<string>('BASIC_AUTH_USER');
    const expectedPassword = this.configService.get<string>('BASIC_AUTH_PASSWORD');

    if (!expectedUsername || !expectedPassword) {
      throw new UnauthorizedException('Basic authentication not configured');
    }

    if (username !== expectedUsername || password !== expectedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }
}
