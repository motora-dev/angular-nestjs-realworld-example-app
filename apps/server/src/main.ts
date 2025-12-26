import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import { doubleCsrf } from 'csrf-csrf';

import { HttpExceptionFilter } from '$filters';
import { LoggingInterceptor } from '$interceptors';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const isProd = config.get('NODE_ENV') === 'production';

  // Set global API prefix for all routes
  app.setGlobalPrefix('api');

  // Cloud Run環境でクライアントの実際のIPアドレスを取得するための設定
  // X-Forwarded-ForヘッダーからIPアドレスを信頼する
  app.set('trust proxy', true);

  // Cookieパーサーを使用してクッキーを解析
  app.use(cookieParser());

  // CORSを有効化
  const allowedOrigins = config.get('CORS_ORIGINS')?.split(',');

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Xsrf-Token'],
  });

  // csrf-csrfの設定
  const csrfSecretRaw = config.get('CSRF_SECRET') || 'fallback-csrf-secret-for-dev-only';
  // 32文字の秘密鍵を生成（元のシークレットをパディング）
  const csrfSecret = csrfSecretRaw.padEnd(32, '0').substring(0, 32);

  const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: () => csrfSecret,
    // Use csrf-session-id cookie as session identifier (set below if not present)
    getSessionIdentifier: (req) => req.cookies?.['csrf-session-id'] || '',
    cookieName: 'XSRF-TOKEN',
    cookieOptions: {
      httpOnly: false,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
    },
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getCsrfTokenFromRequest: (req) => {
      const token = req.headers['x-xsrf-token'];
      // 配列の場合は最初の要素を返す
      return Array.isArray(token) ? token[0] : token;
    },
  });

  // Set csrf-session-id cookie if not present (for CSRF protection without express-session)
  app.use((req: any, res: any, next: any) => {
    if (!req.cookies?.['csrf-session-id']) {
      const csrfSessionId = randomUUID();
      res.cookie('csrf-session-id', csrfSessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      });
      req.cookies = req.cookies || {};
      req.cookies['csrf-session-id'] = csrfSessionId;
    }
    next();
  });

  // req.csrfToken()メソッドを追加
  app.use((req: any, res: any, next: any) => {
    req.csrfToken = () => generateCsrfToken(req, res);
    next();
  });

  // CSRF保護を適用
  app.use(doubleCsrfProtection);

  // CSRFトークンをクッキーに設定
  app.use((req: any, res: any, next: any) => {
    req.csrfToken(); // トークン生成とクッキー設定をライブラリに任せる
    next();
  });

  // ロギング機能を有効化
  app.useGlobalInterceptors(app.get(LoggingInterceptor));

  // グローバルな例外フィルターとして登録
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(config.get('PORT') ?? 4000);
}
bootstrap();
