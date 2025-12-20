import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";
import session from "express-session";

import { LoggingInterceptor } from "$interceptors";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const isProd = config.get("NODE_ENV") === "production";

  // Cloud Run環境でクライアントの実際のIPアドレスを取得するための設定
  // X-Forwarded-ForヘッダーからIPアドレスを信頼する
  app.set("trust proxy", true);

  // Cookieパーサーを使用してクッキーを解析
  app.use(cookieParser());

  // CORSを有効化
  const allowedOrigins = config.get("CORS_ORIGINS")?.split(",");

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Xsrf-Token",
    ],
  });
  app.use(
    session({
      secret:
        config.get("SESSION_SECRET_TOKEN") ||
        "fallback-secret-key-for-dev-only",
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
        secure: isProd, // 開発環境では false, 本番では true を推奨
        path: "/",
        httpOnly: true,
        sameSite: "lax", // strictからlaxに変更して異なるサイト間での認証を許可
      },
    })
  );

  // csrf-csrfの設定
  const sessionSecret =
    config.get("SESSION_SECRET_TOKEN") || "fallback-secret-key-for-dev-only";
  // 32文字の秘密鍵を生成（元のシークレットをパディング）
  const csrfSecret = sessionSecret.padEnd(32, "0").substring(0, 32);

  const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: () => csrfSecret,
    getSessionIdentifier: (req) => req.sessionID || req.session?.id,
    cookieName: "XSRF-TOKEN",
    cookieOptions: {
      httpOnly: false,
      sameSite: "lax",
      secure: isProd,
      path: "/",
    },
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    getCsrfTokenFromRequest: (req) => {
      const token = req.headers["x-xsrf-token"];
      // 配列の場合は最初の要素を返す
      return Array.isArray(token) ? token[0] : token;
    },
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

  await app.listen(config.get("PORT") ?? 4000);
}
bootstrap();
