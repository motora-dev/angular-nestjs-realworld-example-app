import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { ArticleModule } from '$domains/article/article.module';
import { ArticleEditModule } from '$domains/article-edit/article-edit.module';
import { ArticleListModule } from '$domains/article-list/article-list.module';
import { ProfileModule } from '$domains/profile/profile.module';
import { SitemapModule } from '$domains/sitemap';
import { UserModule } from '$domains/user/user.module';
import { UnprocessableEntityError } from '$errors';
import { LoggingInterceptor } from '$interceptors';
import { AuthModule } from '$modules/auth/auth.module';

import type { ValidationErrorCode } from '@monorepo/error-code';

@Module({
  providers: [
    LoggingInterceptor,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Apply rate limiting to all routes
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: (errors) => {
          const validationErrors = errors.flatMap((error) => {
            const messages = Object.values(error.constraints || {});
            return messages.map((message) => ({
              field: error.property,
              code: message as ValidationErrorCode,
            }));
          });
          return new UnprocessableEntityError(validationErrors);
        },
      }),
    },
  ],
  imports: [
    ArticleEditModule,
    ArticleListModule,
    ArticleModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'], // Support multiple files (priority order)
    }),
    ProfileModule,
    SitemapModule,
    UserModule,
    // Rate limiting configuration
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 60 seconds (1 minute)
        limit: 100, // Up to 100 requests from same IP
      },
    ]),
  ],
})
export class AppModule {}
