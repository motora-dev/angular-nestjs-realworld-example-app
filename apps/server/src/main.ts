import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import { doubleCsrf } from 'csrf-csrf';
import * as fs from 'fs';
import yaml from 'js-yaml';

import { HttpExceptionFilter } from '$filters';
import { LoggingInterceptor } from '$interceptors';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const isProd = config.get('NODE_ENV') === 'production';

  // Set global API prefix for all routes
  app.setGlobalPrefix('api');

  // Configure to get client's actual IP address in Cloud Run environment
  // Trust IP address from X-Forwarded-For header
  app.set('trust proxy', true);

  // Use cookie parser to parse cookies
  app.use(cookieParser());

  // Enable CORS
  const allowedOrigins = config
    .get('CORS_ORIGINS')
    ?.split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Xsrf-Token'],
  });

  // Configure csrf-csrf
  const csrfSecretRaw = config.get('CSRF_SECRET') || 'fallback-csrf-secret-for-dev-only';
  // Generate 32-character secret key (pad original secret)
  const csrfSecret = csrfSecretRaw.padEnd(32, '0').substring(0, 32);

  // Cross-subdomain cookie sharing (e.g., '.motora-dev.com' for api.motora-dev.com and realworld.motora-dev.com)
  const cookieDomain = config.get('COOKIE_DOMAIN');

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
      ...(cookieDomain && { domain: cookieDomain }),
    },
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getCsrfTokenFromRequest: (req) => {
      const token = req.headers['x-xsrf-token'];
      // Return first element if array
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
        ...(cookieDomain && { domain: cookieDomain }),
      });
      req.cookies = req.cookies || {};
      req.cookies['csrf-session-id'] = csrfSessionId;
    }
    next();
  });

  // Add req.csrfToken() method
  app.use((req: any, res: any, next: any) => {
    req.csrfToken = () => generateCsrfToken(req, res);
    next();
  });

  // Apply CSRF protection
  app.use(doubleCsrfProtection);

  // Set CSRF token in cookie
  app.use((req: any, res: any, next: any) => {
    req.csrfToken(); // Let library handle token generation and cookie setting
    next();
  });

  // Enable logging
  app.useGlobalInterceptors(app.get(LoggingInterceptor));

  // Register as global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // OpenAPI configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('RealWorld API')
    .setDescription('Conduit API specification - RealWorld example app')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // Output in YAML format
  const yamlString = yaml.dump(document);
  fs.writeFileSync('./openapi.yml', yamlString);

  // Serve OpenAPI JSON at /api/docs.json
  app.use('/api/docs.json', (_req: any, res: any) => {
    res.json(document);
  });

  // Serve Redoc UI at /api/docs
  app.use('/api/docs', (_req: any, res: any) => {
    res.send(`
<!DOCTYPE html>
<html>
  <head>
    <title>RealWorld API - Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>body { margin: 0; padding: 0; }</style>
  </head>
  <body>
    <redoc spec-url='/api/docs.json'></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
</html>
    `);
  });

  await app.listen(config.get('PORT') ?? 4000);
}
bootstrap();
