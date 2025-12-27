# Server Application

NestJS + esbuild + swc + Vitest + Prisma + CQRS を採用したバックエンド API です。

**フレームワーク & ビルド:**</br>
[![NestJS](https://img.shields.io/badge/NestJS-11.1.10-E0234E.svg?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![esbuild](https://img.shields.io/badge/esbuild-0.27.2-FFCF00.svg?logo=esbuild)](https://esbuild.github.io/)
[![SWC](https://img.shields.io/badge/SWC-1.15.7-F8C457.svg)](https://swc.rs/)

**Lint & フォーマット:**</br>
[![ESLint](https://img.shields.io/badge/ESLint-9.39.2-4B32C3.svg?logo=eslint)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3.7.4-F7B93E.svg?logo=prettier)](https://prettier.io/)

**データベース:**</br>
[![Prisma](https://img.shields.io/badge/Prisma-7.2.0-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?logo=postgresql)](https://www.postgresql.org/)

**テスト:**</br>
[![Vitest](https://img.shields.io/badge/Vitest-4.0.16-6E9F18.svg?logo=vitest)](https://vitest.dev/)
[![jsdom](https://img.shields.io/badge/jsdom-27.4.0-F7DF1E.svg)](https://github.com/jsdom/jsdom)

## 目次

**Getting Started**

- [開発コマンド](#開発コマンド)
- [環境変数](#環境変数)

**Architecture**

- [設計思想](#設計思想)
- [アーキテクチャ](#アーキテクチャ)
- [ディレクトリ構成](#ディレクトリ構成)
- [配置基準](#配置基準)

**Patterns**

- [CQRS（@nestjs/cqrs）](#cqrsnestjscqrs)
- [データベースアクセス（Prisma）](#データベースアクセスprisma)
- [エラーハンドリング](#エラーハンドリング)
- [CSRF対策](#csrf対策)
- [認証フロー（OAuth）](#認証フローoauth)
- [API ドキュメント（OpenAPI）](#api-ドキュメントopenapi)

**Development**

- [テスト戦略](#テスト戦略)
- [ビルドシステム（esbuild + SWC）](#ビルドシステムesbuild--swc)
- [開発体験の改善](#開発体験の改善)
- [パッケージ管理（pnpm catalog）](#パッケージ管理pnpm-catalog)
- [設定ファイル](#設定ファイル)

---

## 開発コマンド

**キーワード**: `pnpm`, `開発サーバー`, `ビルド`, `テスト`, `Lint`, `フォーマット`

このセクションでは、プロジェクトで使用する主要な開発コマンドを説明します。

```bash
# 完全クリーンアップ（node_modulesも削除）
pnpm clean

# キャッシュクリア（.tsbuildinfo, .turbo, coverage, dist）
pnpm clean:cache

# 開発サーバー起動（watch + debug）
pnpm start

# ビルド
pnpm build

# 本番サーバー起動
pnpm start:prd

# テスト
pnpm test

# ユニットテストのみ
pnpm test:unit

# E2Eテストのみ
pnpm test:e2e

# カバレッジ付きテスト
pnpm test:coverage

# Lint
pnpm lint

# Lint + 自動修正
pnpm lint:fix

# フォーマットチェック
pnpm format

# フォーマット + 自動修正
pnpm format:fix

# 型チェック
pnpm tsc

# 全チェック（lint + format + tsc + test）
pnpm check-all
```

## 環境変数

**キーワード**: `環境変数`, `.env`, `データベース`, `CORS`

このセクションでは、プロジェクトで必要な環境変数とその設定方法について説明します。

| 変数名                   | 説明                                                            | 例                                        | 必須   |
| ------------------------ | --------------------------------------------------------------- | ----------------------------------------- | ------ |
| **Database**             |                                                                 |                                           |        |
| `DATABASE_URL`           | PostgreSQLデータベースURL（接続プール用）                       | `postgresql://postgres:pass@host/db`      | はい   |
| **Server**               |                                                                 |                                           |        |
| `NODE_ENV`               | 実行環境                                                        | `development` / `production`              | いいえ |
| `PORT`                   | サーバーポート番号                                              | `4000`                                    | いいえ |
| **Client / CORS / CSRF** |                                                                 |                                           |        |
| `CLIENT_URL`             | クライアントアプリのURL                                         | `http://localhost:4200`                   | はい   |
| `CORS_ORIGINS`           | CORS許可オリジン（カンマ区切り）                                | `http://localhost:4200`                   | はい   |
| `CSRF_SECRET`            | CSRF保護用シークレットキー                                      | `your-csrf-secret-key`                    | はい   |
| `COOKIE_DOMAIN`          | CSRF Cookieのドメイン設定（サブドメイン間でCookie共有する場合） | `.realworld.motora-dev.com`               | いいえ |
| **Google OAuth**         |                                                                 |                                           |        |
| `GOOGLE_CLIENT_ID`       | Google OAuth Client ID                                          | `xxx.apps.googleusercontent.com`          | はい   |
| `GOOGLE_CLIENT_SECRET`   | Google OAuth Secret                                             | `GOCSPX-xxx`                              | はい   |
| `GOOGLE_CALLBACK_URL`    | Google OAuth Callback URL                                       | `http://localhost:4000/api/auth/callback` | はい   |
| **JWT**                  |                                                                 |                                           |        |
| `JWT_PRIVATE_KEY`        | JWT署名用RSA秘密鍵（PEM形式）                                   | `-----BEGIN RSA PRIVATE KEY-----\n...`    | はい   |
| `JWT_PUBLIC_KEY`         | JWT検証用RSA公開鍵（PEM形式）                                   | `-----BEGIN PUBLIC KEY-----\n...`         | はい   |

### 環境変数の設定

```bash
# .env.exampleをコピー
cp .env.example .env

# エディタで.envを編集し、実際の値を設定
```

### RSA鍵ペアの生成

JWT署名に使用するRSA鍵ペアを生成します：

```bash
# 秘密鍵を生成（2048ビット）
openssl genrsa -out private.pem 2048

# 公開鍵を抽出
openssl rsa -in private.pem -pubout -out public.pem
```

生成した鍵を環境変数に設定する際は、改行を `\n` に置換します：

```bash
# 秘密鍵を1行に変換（.env用）
node -e "console.log('JWT_PRIVATE_KEY=' + JSON.stringify(require('fs').readFileSync('private.pem', 'utf8').trim()))"

# 公開鍵を1行に変換（.env用）
node -e "console.log('JWT_PUBLIC_KEY=' + JSON.stringify(require('fs').readFileSync('public.pem', 'utf8').trim()))"
```

**GCP Secret Manager を使用する場合**は、改行をそのまま保持できるためエスケープ不要です。

**注意**: 秘密鍵は絶対にGitにコミットしないでください。本番環境ではGCP Secret Manager等のシークレット管理サービスの使用を推奨します。

---

## 設計思想

**キーワード**: `設計原則`, `Vertical Slice Architecture`, `Layered Architecture`, `CQRS`, `Repositoryパターン`

このセクションでは、プロジェクトの設計思想と、なぜこの構成を採用したかの理由を説明します。

### なぜこの構成か

1. **アルファベット順の一貫性**: `domains → modules → shared` の順で視覚的に整理
2. **Vertical Slice Architecture**: 各ドメインが独立したスライスとして完結し、凝集度が高い
3. **CQRS**: 読み取り（Query）と書き込み（Command）を分離し、責務を明確化
4. **DDD境界の意識**: ドメイン固有のものはドメイン内に、共有するものだけが上位レイヤーに昇格
5. **Repository パターン**: データアクセスを抽象化し、ビジネスロジックとの結合度を下げる

### なぜ Clean Architecture ではなく Layered Architecture か

本プロジェクトは**厳密なClean Architecture**ではなく、**Vertical Slice + Layered Architecture**を採用しています。

#### Clean Architecture との違い

| 観点              | Clean Architecture         | 本プロジェクト（Layered） |
| ----------------- | -------------------------- | ------------------------- |
| 依存の方向        | 外→内（円形、DIP適用）     | 上→下（一方向）           |
| Repository        | Interface + Implementation | 具象クラスのみ            |
| 依存性逆転（DIP） | 必須                       | 不採用                    |
| 認知負荷          | 高い（指数的増加）         | 低い（線形/一定）         |

#### DIPを採用しない理由

1. **Vertical Sliceによるスライス独立**
   - 各ドメインが完全に独立しており、変更の影響がスライス内に閉じる
   - 他スライスの内部実装を知る必要がない

2. **NestJSのDIで十分なテスタビリティ**
   - テスト時にMockを `providers` で差し替え可能
   - インターフェースなしでもテスト容易性を確保

3. **Prismaへのロックインを許容**
   - DBを変更するシナリオがほぼない
   - 過度な抽象化は複雑さだけを増やす

4. **依存方向の縛りで十分**
   - `Controller → Handler → Service → Repository → Prisma`
   - この方向への依存のみ許可し、逆方向は禁止

#### 認知負荷の観点

- **Clean Architecture**: 機能追加ごとにInterface + Implementationのペアが増加 → 関係性の把握が困難（指数的増加）
- **Vertical Slice + Layered**: 独立したスライスが増えるだけ → 各スライスは同じパターン（線形増加、または一定）

### NestJS公式スタイルガイドとの差異

本構成はNestJS公式スタイルガイドの推奨（機能ごとのモジュール構成）とは一部異なります。これは設計原則（Vertical Slice / Layered Architecture / CQRS）を優先した意図的な選択です。

チームメンバーはこのREADMEを参照し、配置基準を理解した上で開発を行ってください。

## アーキテクチャ

**キーワード**: `Vertical Slice Architecture`, `Layered Architecture`, `レイヤー構成`, `依存関係`

このセクションでは、プロジェクト全体のアーキテクチャ設計について説明します。Vertical Slice ArchitectureとLayered Architectureを組み合わせた構成を採用しています。

### レイヤー構成

| ディレクトリ | レイヤー              | 責務                                             | 状態   |
| ------------ | --------------------- | ------------------------------------------------ | ------ |
| `domains/`   | Presentation + Domain | エンドポイント・ビジネスロジック・データアクセス | 使用中 |
| `modules/`   | Application           | 複数ドメイン間で共有するモジュール               | 使用中 |
| `shared/`    | Infrastructure        | アダプター・ユーティリティ・共通処理             | 使用中 |

### 依存関係のルール

```
domains/ ──→ modules/ ──→ shared/
```

- 上位レイヤーは下位レイヤーに依存できる（右方向への依存のみ許可）
- 下位レイヤーは上位レイヤーに依存してはならない（左方向への依存は禁止）
- `shared/` は全レイヤーから参照可能

## ディレクトリ構成

**キーワード**: `Vertical Slice`, `ディレクトリ構造`, `domains/`, `modules/`, `shared/`

このセクションでは、プロジェクトのディレクトリ構成と各ディレクトリの役割を説明します。

```
src/
├── domains/          # (d) 各ドメイン（Vertical Slice）
│   └── {domain}/
│       ├── {domain}.controller.ts  # エンドポイント定義
│       ├── {domain}.module.ts      # モジュール定義
│       ├── commands/               # 書き込み系（CQRS）
│       │   └── {action}/
│       │       ├── {action}.command.ts
│       │       └── {action}.handler.ts
│       ├── queries/                # 読み取り系（CQRS）
│       │   └── {action}/
│       │       ├── {action}.query.ts
│       │       └── {action}.handler.ts
│       ├── contracts/              # リクエスト/レスポンス型
│       │   ├── {domain}.dto.ts     # DTO定義
│       │   ├── {domain}.input.ts   # 入力型定義
│       │   └── {domain}.model.ts   # モデル定義
│       ├── presenters/             # レスポンス整形
│       ├── repositories/           # データアクセス
│       └── services/               # ビジネスロジック
│   └── sitemap/            # サイトマップドメイン
│       ├── sitemap.controller.ts
│       └── ...
├── modules/          # (m) 複数ドメイン間で共有するモジュール
│   └── auth/             # 認証モジュール
├── shared/           # (s) 共有リソース
│   ├── adapters/         # 外部サービスアダプター（Prisma）
│   ├── decorators/       # カスタムデコレーター
│   ├── errors/           # エラークラス
│   ├── filters/          # 例外フィルター
│   ├── guards/           # 認証ガード
│   ├── interceptors/     # インターセプター
│   └── utils/            # ユーティリティ
├── types/            # 型定義
├── app.module.ts     # ルートモジュール
└── main.ts           # エントリーポイント
```

### ドメインコンポーネントの標準パターン

各ドメインは **Controller + Query/Command + Service + Repository** の構成を標準とします。

```
domains/{domain}/
├── {domain}.controller.ts      # HTTPエンドポイント
├── {domain}.module.ts          # モジュール定義
├── commands/                   # 書き込み系（POST, PUT, DELETE）
│   ├── index.ts
│   └── {action}/
│       ├── {action}.command.ts
│       └── {action}.handler.ts
├── queries/                    # 読み取り系（GET）
│   ├── index.ts
│   └── {action}/
│       ├── {action}.query.ts
│       └── {action}.handler.ts
├── contracts/                  # リクエスト/レスポンス型
│   ├── index.ts
│   ├── {domain}.dto.ts
│   ├── {domain}.input.ts
│   └── {domain}.model.ts
├── presenters/                 # レスポンス整形
│   └── index.ts
├── repositories/               # データアクセス
│   └── index.ts
└── services/                   # ビジネスロジック
    └── index.ts
```

## 配置基準

**キーワード**: `ファイル配置`, `配置ルール`, `パスエイリアス`, `命名規則`

このセクションでは、ファイルやコンポーネントをどこに配置すべきかの基準を説明します。詳細は[ディレクトリ構成](#ディレクトリ構成)セクションも参照してください。

### どこに何を置くか

| 対象                       | 配置先                           | 例                                      |
| -------------------------- | -------------------------------- | --------------------------------------- |
| HTTPエンドポイント         | `domains/{domain}/`              | `domains/article/article.controller.ts` |
| 読み取りロジック（GET）    | `domains/{domain}/queries/`      | `queries/get-article/`                  |
| 書き込みロジック（POST等） | `domains/{domain}/commands/`     | `commands/create-article/`              |
| リクエスト/レスポンス型    | `domains/{domain}/contracts/`    | `contracts/article.dto.ts`              |
| レスポンス整形             | `domains/{domain}/presenters/`   | `presenters/article.presenter.ts`       |
| データアクセス             | `domains/{domain}/repositories/` | `repositories/article.repository.ts`    |
| ビジネスロジック           | `domains/{domain}/services/`     | `services/article.service.ts`           |
| 複数ドメイン共有モジュール | `modules/`                       | `modules/auth/`                         |
| 外部サービスアダプター     | `shared/adapters/`               | `adapters/prisma/prisma.adapter.ts`     |
| カスタムデコレーター       | `shared/decorators/`             | `decorators/current-user.decorator.ts`  |
| エラークラス               | `shared/errors/`                 | `errors/app-error.ts`                   |
| 例外フィルター             | `shared/filters/`                | `filters/http-exception.filter.ts`      |
| 認証ガード                 | `shared/guards/`                 | `guards/auth.guard.ts`                  |
| インターセプター           | `shared/interceptors/`           | `interceptors/logging.interceptor.ts`   |
| ユーティリティ関数         | `shared/utils/`                  | `utils/id-generator.ts`                 |

### パスエイリアス

```typescript
import { PrismaAdapter } from '$adapters';
import { CurrentUser } from '$decorators';
import { AppError, NotFoundError } from '$errors';
import { HttpExceptionFilter } from '$filters';
import { AuthService } from '$modules/auth';
```

| エイリアス      | パス                      |
| --------------- | ------------------------- |
| `$adapters`     | `src/shared/adapters`     |
| `$decorators`   | `src/shared/decorators`   |
| `$domains/*`    | `src/domains/*`           |
| `$errors`       | `src/shared/errors`       |
| `$filters`      | `src/shared/filters`      |
| `$guards`       | `src/shared/guards`       |
| `$interceptors` | `src/shared/interceptors` |
| `$modules/*`    | `src/modules/*`           |
| `$shared/*`     | `src/shared/*`            |
| `$utils`        | `src/shared/utils`        |

### 命名規則

- コントローラー: `{domain}.controller.ts`
- モジュール: `{domain}.module.ts`
- サービス: `{domain}.service.ts`
- リポジトリ: `{domain}.repository.ts`
- DTO: `{domain}.dto.ts`
- Input: `{domain}.input.ts`
- Model: `{domain}.model.ts`
- Presenter: `{domain}.presenter.ts`
- Query: `{action}.query.ts`
- Command: `{action}.command.ts`
- Handler: `{action}.handler.ts`
- テスト: `{name}.test.ts`

---

## CQRS（@nestjs/cqrs）

**キーワード**: `CQRS`, `Command`, `Query`, `Handler`, `@nestjs/cqrs`, `Layered Architecture`

このセクションでは、CQRSパターンを使用した読み取りと書き込みの責務分離について説明します。

**関連ファイル**:

- `apps/server/src/domains/{domain}/queries/{action}/{action}.query.ts` - Query定義
- `apps/server/src/domains/{domain}/queries/{action}/{action}.handler.ts` - QueryHandler実装
- `apps/server/src/domains/{domain}/commands/{action}/{action}.command.ts` - Command定義
- `apps/server/src/domains/{domain}/commands/{action}/{action}.handler.ts` - CommandHandler実装

### ドメイン内部のレイヤー構成

各ドメイン（Vertical Slice）内部では、Layered Architectureを採用しています。

| ディレクトリ       | レイヤー     | 責務                           |
| ------------------ | ------------ | ------------------------------ |
| `controller`       | Presentation | HTTPリクエスト/レスポンス処理  |
| `presenters`       | Presentation | レスポンスデータの整形         |
| `queries/commands` | Application  | ユースケースの調整（CQRS）     |
| `services`         | Application  | ビジネスロジック               |
| `repositories`     | Data Access  | データベースアクセス（Prisma） |
| `contracts`        | Shared       | DTO/Input/Model定義            |

#### データフロー

```
Controller → QueryHandler/CommandHandler → Service → Repository → PrismaAdapter
```

### 設計原則

CQRS（Command Query Responsibility Segregation）パターンにより、読み取りと書き込みの責務を分離します。

#### Query（読み取り）

データの取得のみを行い、状態を変更しません。

```typescript
// Recommended: Extend Query<T> for automatic type inference
// queries/get-articles/get-articles.query.ts
import { Query } from '@nestjs/cqrs';
import type { GetArticlesQueryDto, MultipleArticlesDto } from '../../contracts';

export class GetArticlesQuery extends Query<MultipleArticlesDto> {
  constructor(
    public readonly params: GetArticlesQueryDto,
    public readonly currentUserId?: number,
  ) {
    super();
  }
}
```

```typescript
// Recommended: QueryHandler only retrieves data
// queries/get-articles/get-articles.handler.ts
@QueryHandler(GetArticlesQuery)
export class GetArticlesHandler implements IQueryHandler<GetArticlesQuery> {
  constructor(private readonly articleListService: ArticleListService) {}

  async execute(query: GetArticlesQuery) {
    // 戻り値型を明示しないことで、Query<MultipleArticlesDto> の型が変われば自動で追従
    return await this.articleListService.getArticles(query.params, query.currentUserId);
  }
}
```

#### Command（書き込み）

状態を変更する操作を行います。

```typescript
// Recommended: Extend Command<T> for automatic type inference
// commands/create-article/create-article.command.ts
import { Command } from '@nestjs/cqrs';
import type { CreateArticleRequestDto, SingleArticleDto } from '../../contracts';

export class CreateArticleCommand extends Command<SingleArticleDto> {
  constructor(
    public readonly request: CreateArticleRequestDto,
    public readonly currentUserId: number,
  ) {
    super();
  }
}
```

```typescript
// Recommended: CommandHandler executes state-changing operations
// commands/create-article/create-article.handler.ts
@CommandHandler(CreateArticleCommand)
export class CreateArticleHandler implements ICommandHandler<CreateArticleCommand> {
  constructor(private readonly articleService: ArticleEditService) {}

  async execute(command: CreateArticleCommand) {
    // 戻り値型を明示しないことで、Command<SingleArticleDto> の型が変われば自動で追従
    const article = await this.articleService.createArticle(command.request, command.currentUserId);
    return { article };
  }
}
```

#### 型推論（Type Inference）

`Query<T>` または `Command<T>` を継承することで、`QueryBus.execute()` や `CommandBus.execute()` の戻り値の型が自動的に推論されます。これにより、型アサーション（`as`）が不要になります。

**Query の例:**

```typescript
// Recommended: Extend Query<T> for automatic type inference
// queries/get-auth-user-info/get-auth-user-info.query.ts
import { Query } from '@nestjs/cqrs';
import type { UserInfo } from '../../contracts';

export class GetAuthUserInfoQuery extends Query<UserInfo> {
  constructor(public readonly payload: JwtPayload) {
    super();
  }
}
```

```typescript
// Controller での使用（型推論が自動的に効く）
@Controller('auth')
export class AuthController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('check-session')
  async checkSession(): Promise<CheckSessionResponse> {
    // user は自動的に UserInfo 型として推論される
    const user = await this.queryBus.execute(new GetAuthUserInfoQuery(payload));
    return { authenticated: true, user };
  }
}
```

**Handler での実装:**

Handler の `execute` メソッドでは、戻り値の型を明示的に書く必要はありません。`Query<T>` を継承している場合、TypeScript の型推論により自動的に正しい型が推論されます。

```typescript
// Recommended: Handler の戻り値型は明示しない（型推論に任せる）
// queries/get-auth-user-info/get-auth-user-info.handler.ts
@QueryHandler(GetAuthUserInfoQuery)
export class GetAuthUserInfoHandler implements IQueryHandler<GetAuthUserInfoQuery> {
  constructor(private readonly service: AuthService) {}

  async execute(query: GetAuthUserInfoQuery) {
    // 戻り値型を明示しないことで、Query<UserInfo> の型が変われば自動で追従
    const user = await this.service.findUserById(query.payload.id);
    if (!user) {
      throw new NotFoundError(ERROR_CODE.USER_NOT_FOUND);
    }
    return toUserInfo(user);
  }
}
```

**Command の例:**

```typescript
// Recommended: Extend Command<T> for automatic type inference
// commands/create-article/create-article.command.ts
import { Command } from '@nestjs/cqrs';
import type { ArticleResponse } from '../../contracts';

export class CreateArticleCommand extends Command<ArticleResponse> {
  constructor(
    public readonly title: string,
    public readonly content: string,
  ) {
    super();
  }
}
```

**メリット:**

- 型アサーション（`as`）が不要
- 型安全性が向上
- IDE の自動補完が効く
- コンパイル時に型エラーを検出可能
- Handler の戻り値型を明示しないことで、Query の型が変われば自動で追従（DRY原則）

### Controller での使用

```typescript
// Recommended: Use QueryBus/CommandBus in Controller for CQRS pattern
@Controller('article-list')
export class ArticleListController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  async getArticleList(): Promise<ArticleListDto> {
    return await this.queryBus.execute(new GetArticleListQuery());
  }
}
```

### メリット

- **責務の分離**: 読み取りと書き込みのロジックが明確に分離
- **スケーラビリティ**: 読み取りと書き込みを独立してスケール可能
- **テスタビリティ**: 各 Handler が独立しており、テストが容易

## データベースアクセス（Prisma）

**キーワード**: `Prisma`, `データベース`, `Repositoryパターン`, `PrismaAdapter`, `ESModule`

このセクションでは、Prismaを使用したデータベースアクセスの実装パターンについて説明します。

**関連ファイル**:

- `apps/server/src/shared/adapters/prisma/prisma.adapter.ts` - PrismaAdapter実装
- `apps/server/src/domains/{domain}/repositories/{domain}.repository.ts` - Repository実装

### Prisma ESModule 対応

#### 背景

Prisma 7.x 以降、`@prisma/client` は ESModule として提供されるようになりました。これは Node.js の ESModule 移行に対応するための変更です。

#### `type: "module"` 環境での注意点

このプロジェクトは `"type": "module"` を指定しており、すべてのファイルが ESModule として扱われます。これに伴い、以下の対応が必要でした：

1. **esbuild の使用が必須** - `tsc`（TypeScript コンパイラ）や SWC では ESModule 環境でのパス解決やバンドルができない
2. **`format: 'esm'` の指定** - esbuild の出力形式を ESModule に設定
3. **`reflect-metadata` のインポート** - バナーで先頭にインポート文を追加

```javascript
// Recommended: Set format: 'esm' and reflect-metadata banner for ESModule environment
// From esbuild.config.mjs
const config = {
  format: 'esm',
  banner: {
    js: "import 'reflect-metadata';",
  },
};
```

#### Prisma クライアントの配置

Prisma クライアントは `@monorepo/database` パッケージで管理され、モノレポ内で共有されています：

```
packages/database/
├── prisma/
│   └── schema.prisma       # スキーマ定義
└── src/
    └── generated/
        └── prisma-client/  # 生成されたクライアント
```

### PrismaAdapter

Prisma Client を NestJS のライフサイクルに統合したアダプターを使用します。

```typescript
// Recommended: Integrate Prisma Client with NestJS lifecycle using PrismaAdapter
// shared/adapters/prisma/prisma.adapter.ts
import { PrismaClient } from '@monorepo/database/client';

@Injectable()
export class PrismaAdapter extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### Repository パターン

各ドメインで Repository を定義し、データアクセスを抽象化します。

```typescript
// Recommended: Abstract data access with Repository pattern
// domains/article-list/repositories/article-list.repository.ts
@Injectable()
export class ArticleListRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async getArticleList(): Promise<Article[]> {
    return await this.prisma.article.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
```

### データベースセットアップ

```bash
# Prismaクライアント生成
pnpm prisma generate

# データベーススキーマの同期
pnpm prisma db push

# シードデータの投入
pnpm prisma db seed
```

## エラーハンドリング

**キーワード**: `エラーハンドリング`, `AppError`, `HttpExceptionFilter`, `例外処理`, `エラーレスポンス`

このセクションでは、APIエラーやビジネスロジックエラーの処理方法について説明します。

**関連ファイル**:

- `apps/server/src/shared/errors/app-error.ts` - AppError実装
- `apps/server/src/shared/filters/http-exception.filter.ts` - HttpExceptionFilter実装

### AppError

ビジネスロジック層で発生するエラーを表すカスタム例外クラスです。HTTPステータスコードに対応した派生クラスを使用します。

```typescript
// Recommended: Use AppError and its derived classes for business logic errors
// shared/errors/app-error.ts

// Base class for all application errors
export abstract class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly params?: ErrorParams,
  ) {
    super(code);
    this.name = 'AppError';
  }
}

// Use for 400 Bad Request errors
export class BadRequestError extends AppError {
  constructor(code: BadRequestCode, params?: ErrorParams) {
    super(code, params);
    this.name = 'BadRequestError';
  }
}

// Use for 401 Unauthorized errors
export class UnauthorizedError extends AppError {
  constructor(code: UnauthorizedCode, params?: ErrorParams) {
    super(code, params);
    this.name = 'UnauthorizedError';
  }
}

// Use for 403 Forbidden errors
export class ForbiddenError extends AppError {
  constructor(code: ForbiddenCode, params?: ErrorParams) {
    super(code, params);
    this.name = 'ForbiddenError';
  }
}

// Use for 404 Not Found errors
export class NotFoundError extends AppError {
  constructor(code: NotFoundCode, params?: ErrorParams) {
    super(code, params);
    this.name = 'NotFoundError';
  }
}

// Use for 409 Conflict errors
export class ConflictError extends AppError {
  constructor(code: ConflictCode, params?: ErrorParams) {
    super(code, params);
    this.name = 'ConflictError';
  }
}

// Use for 500 Internal Server errors
export class InternalServerError extends AppError {
  constructor(code: InternalServerErrorCode, params?: ErrorParams) {
    super(code, params);
    this.name = 'InternalServerError';
  }
}

// 3. Validation error types (for 422 Unprocessable Entity)

/**
 * Validation field error for GitHub-style error response
 */
export interface ValidationFieldError {
  field: string;
  code: ValidationErrorCode;
}

// Use for 422 Unprocessable Entity errors (validation errors)
export class UnprocessableEntityError extends AppError {
  constructor(public readonly errors: ValidationFieldError[]) {
    super(ERROR_CODE.VALIDATION_ERROR);
    this.name = 'UnprocessableEntityError';
  }
}
```

```typescript
// Recommended: Use appropriate error class for each situation
// Usage examples
import { ERROR_CODE } from '@monorepo/error-code';
import { NotFoundError, UnauthorizedError, UnprocessableEntityError } from '$errors';

throw new UnauthorizedError(ERROR_CODE.UNAUTHORIZED);
throw new NotFoundError(ERROR_CODE.ARTICLE_NOT_FOUND);

// Validation Error
throw new UnprocessableEntityError([{ field: 'email', code: ERROR_CODE.INVALID_EMAIL }]);
```

### HttpExceptionFilter

すべての例外をキャッチし、統一されたレスポンス形式に変換します。
バリデーションエラー（422）の場合は GitHub スタイルの詳細なエラー情報を返し、それ以外は標準のエラーレスポンスを返します。

また、本番環境（`NODE_ENV=production`）では、5xx 系エラーの詳細（`errorCode` や `params`）を隠蔽してセキュリティを確保しています。

```typescript
// Recommended: Use HttpExceptionFilter to convert all exceptions to unified format
// shared/filters/http-exception.filter.ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Handle AppError / HttpException / other errors

    // UnprocessableEntityError returns GitHub-style response
    if (errors) {
      response.status(status).json({
        message,
        errors,
      });
    } else {
      response.status(status).json({
        errorCode,
        message,
        params,
      });
    }
  }
}
```

### エラーレスポンス形式

**通常のエラー:**

```json
{
  "errorCode": "NOT_FOUND",
  "message": "Article not found",
  "params": { "id": "123" }
}
```

**バリデーションエラー (422):**

```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation Failed",
  "errors": [
    {
      "field": "email",
      "code": "INVALID_EMAIL"
    }
  ]
}
```

## CSRF対策

**キーワード**: `CSRF`, `Double Submit Cookie`, `csrf-csrf`, `セキュリティ`

このセクションでは、CSRF（Cross-Site Request Forgery）攻撃からAPIを保護するための実装について説明します。

**関連ファイル**:

- `apps/server/src/main.ts` - CSRF設定

### Double Submit Cookie パターン

本プロジェクトでは `csrf-csrf` ライブラリを使用した **Double Submit Cookie** パターンを採用しています。

```typescript
// main.ts
import { doubleCsrf } from 'csrf-csrf';

// Cross-subdomain cookie sharing (e.g., '.realworld.motora-dev.com' for api.realworld.motora-dev.com and realworld.motora-dev.com)
const cookieDomain = config.get('COOKIE_DOMAIN');

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => csrfSecret,
  getSessionIdentifier: (req) => req.cookies?.['csrf-session-id'] || '',
  cookieName: 'XSRF-TOKEN',
  cookieOptions: {
    httpOnly: false, // JavaScriptから読み取り可能
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    ...(cookieDomain && { domain: cookieDomain }),
  },
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req) => req.headers['x-xsrf-token'],
});
```

### セッション識別（express-session不要）

`csrf-session-id` クッキーを使用してセッションを識別します。これにより `express-session` なしで CSRF 保護を実現しています。

```typescript
// csrf-session-id がない場合は自動生成
app.use((req, res, next) => {
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
  }
  next();
});
```

### サブドメイン間でのCookie共有

APIサーバーとクライアントが異なるサブドメイン（例: `api.realworld.motora-dev.com` と `realworld.motora-dev.com`）で動作する場合、`COOKIE_DOMAIN`環境変数を設定することでCookieを共有できます。

```bash
# .env
COOKIE_DOMAIN=.realworld.motora-dev.com
```

**注意**: ドメインの先頭にドット（`.`）を付けることで、すべてのサブドメインでCookieが共有されます。この設定がない場合、Cookieは各サブドメインに限定されます。

### クライアント側の実装

クライアントは `XSRF-TOKEN` クッキーの値を読み取り、`x-xsrf-token` ヘッダーに設定してリクエストを送信します。

## 認証フロー（OAuth）

**キーワード**: `OAuth`, `Google認証`, `JWT`, `Access Token`, `Refresh Token`

このセクションでは、Google OAuth を使用した認証フローと、JWT によるセッション管理について説明します。

**関連ファイル**:

- `apps/server/src/modules/auth/auth.controller.ts` - 認証エンドポイント
- `apps/server/src/modules/auth/services/auth.service.ts` - 認証ロジック

### 認証フロー概要

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Google

    Client->>Server: GET /api/auth/login/google
    Server->>Google: リダイレクト（OAuth同意画面）
    Google->>Server: コールバック（認可コード）
    alt ユーザーが存在
        Server->>Client: access-token, refresh-token 設定
        Client->>Client: ホームへリダイレクト
    else 新規ユーザー
        Server->>Client: pending-registration 設定
        Client->>Client: 登録ページへリダイレクト
        Client->>Server: POST /api/auth/register
        Server->>Client: access-token, refresh-token 設定
    end
```

### Pending Registration パターン

新規ユーザーの場合、OAuth 認証後に直接アカウントを作成せず、一時的な `pending-registration` トークンを発行します。

**メリット:**

- ユーザーが自分のユーザー名を選択できる
- OAuth プロバイダーから取得したメールアドレスを確認画面で表示できる
- 誤ったアカウント作成を防止

### トークン構成

| トークン        | 有効期限 | 用途                          | Cookie パス |
| --------------- | -------- | ----------------------------- | ----------- |
| `access-token`  | 短寿命   | API認証（各リクエストで送信） | `/`         |
| `refresh-token` | 長寿命   | Access Token の更新           | `/api/auth` |

### check-session エンドポイント

クライアントが認証状態を確認するためのエンドポイントです。**401を返さない**設計により、コンソールエラーを回避しています。

```typescript
// GET /api/auth/check-session
// 常に 200 OK を返し、authenticated: true/false で状態を通知
async checkSession(): Promise<{ authenticated: boolean; user?: User }> {
  // 1. access-token が有効 → authenticated: true
  // 2. refresh-token で更新可能 → authenticated: true
  // 3. いずれも無効 → authenticated: false
}
```

## API ドキュメント（OpenAPI）

**キーワード**: `OpenAPI`, `Swagger`, `Redoc`, `APIドキュメント`

このセクションでは、OpenAPI 仕様によるAPI ドキュメントの提供について説明します。

**関連ファイル**:

- `apps/server/src/main.ts` - OpenAPI設定

### Redoc UI

開発・本番環境で API ドキュメントを提供しています。

| エンドポイント   | 内容                                     |
| ---------------- | ---------------------------------------- |
| `/api/docs`      | Redoc UI（インタラクティブドキュメント） |
| `/api/docs.json` | OpenAPI JSON 仕様                        |

### 設定例

```typescript
// main.ts
const swaggerConfig = new DocumentBuilder()
  .setTitle('RealWorld API')
  .setDescription('Conduit API specification - RealWorld example app')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, swaggerConfig);

// Redoc UI を提供
app.use('/api/docs', (_req, res) => {
  res.send(`
    <redoc spec-url='/api/docs.json'></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  `);
});
```

---

## テスト戦略

**キーワード**: `テスト`, `Vitest`, `ユニットテスト`, `E2Eテスト`, `カバレッジ`, `SWC`

このセクションでは、テストの実行方法と、Vitestを使用したテスト戦略について説明します。

Jest と比較して以下の利点があります：

1. **高速な起動** - ESModule ネイティブで起動が速い
2. **SWC によるトランスパイル** - テストファイルの変換が高速
3. **Vite エコシステムとの統合** - 設定の共通化が可能

### テスト構成

Vitest を使用し、unit テストと e2e テストを分離して管理します。

```bash
pnpm test           # 全テスト実行
pnpm test:unit      # ユニットテストのみ
pnpm test:e2e       # E2Eテストのみ
pnpm test:coverage  # カバレッジ付き
```

### テストの種類

テストは 2 種類に分離されています：

| テスト種別     | ファイルパターン | 説明                   |
| -------------- | ---------------- | ---------------------- |
| ユニットテスト | `*.test.ts`      | 単体機能のテスト       |
| E2E テスト     | `*.spec.ts`      | エンドツーエンドテスト |

### SWC による高速トランスパイル

Vitest でも SWC を使用してデコレーターを変換しています：

```typescript
// From vitest.config.ts
const swcPlugin = swc.vite({
  jsc: {
    parser: { syntax: 'typescript', decorators: true },
    transform: {
      legacyDecorator: true,
      decoratorMetadata: true,
    },
  },
});
```

### V8 カバレッジ

V8 エンジンのネイティブカバレッジ機能を使用しており、高速にカバレッジレポートを生成できます：

```bash
# カバレッジ付きでテスト実行
pnpm test:coverage
```

### テストファイルの配置

テストの種類によって配置場所が異なります：

| テスト種別     | 配置場所                          | 理由                   |
| -------------- | --------------------------------- | ---------------------- |
| ユニットテスト | `src/` 配下、対象ファイルと同階層 | 対象コードとの近接性   |
| E2E テスト     | `test/` ディレクトリ配下          | アプリ全体を対象とする |

**ユニットテスト例：**

```
src/domains/article-list/
├── article-list.controller.ts
├── article-list.controller.test.ts    # 対象と同階層
├── article-list.module.ts
├── article-list.module.test.ts
└── queries/
    └── get-article-list/
        ├── get-article-list.query.ts
        └── get-article-list.query.test.ts
```

**E2Eテスト例：**

```
test/
└── shared/
    ├── filters/
    │   └── http-exception.filter.spec.ts
    └── interceptors/
        └── logging.interceptor.spec.ts
```

### 命名規則

- ユニットテスト: `{name}.test.ts`
- E2Eテスト: `{name}.spec.ts`

### テストのベストプラクティス

**expectの期待値はリテラル（ベタ書き）で記述**

テストの可読性と意図の明確化のため、`expect` の期待値には変数ではなくリテラル値を使用します。

```typescript
// Good - 期待値がすぐにわかる
expect(error.name).toBe('BadRequestError');
expect(result.count).toBe(5);

// Bad - 期待値を追跡する必要がある
const expectedName = 'BadRequestError';
expect(error.name).toBe(expectedName);
```

**理由：**

- テストコードを読むだけで期待される結果がわかる
- 変数の定義箇所を探す必要がない
- テスト失敗時のデバッグが容易

## ビルドシステム（esbuild + SWC）

**キーワード**: `esbuild`, `SWC`, `ビルド`, `デコレーター`, `ESModule`, `ホットリロード`

このセクションでは、esbuildとSWCを使用したビルドシステムについて説明します。

### なぜ esbuild を使うのか

従来の NestJS プロジェクトでは `tsc`（TypeScript コンパイラ）を使用していましたが、以下の問題がありました：

1. **ビルド速度が遅い** - プロジェクトが大きくなるとビルドに数十秒かかる
2. **ESModule 環境でのパス解決問題** - `$domains/*` などのパスエイリアスが解決できない
3. **Prisma クライアントの問題** - Prisma 7.x 以降の ESModule 形式クライアントを正しく処理できない

esbuild を使用することで、これらすべての問題を解決しています。

### SWC プラグインによるデコレーターサポート

NestJS は TypeScript のデコレーターを多用しますが、esbuild 単体ではデコレーターメタデータ（`emitDecoratorMetadata`）をサポートしていません。

そこで、SWC を esbuild のプラグインとして使用し、デコレーターを正しく変換しています：

```javascript
// Recommended: Support decorator metadata with SWC plugin
// Excerpt from esbuild.config.mjs
function swcPlugin() {
  return {
    name: 'swc-decorator',
    setup(build) {
      build.onLoad({ filter: /\.ts$/ }, async (args) => {
        const source = await fs.promises.readFile(args.path, 'utf8');
        const result = await swc.transform(source, {
          jsc: {
            parser: { syntax: 'typescript', decorators: true },
            transform: {
              legacyDecorator: true,
              decoratorMetadata: true, // This is the key point
            },
          },
        });
        return { contents: result.code, loader: 'js' };
      });
    },
  };
}
```

### ホットリロード対応の開発サーバー

`--watch` フラグを付けてビルドすると、ファイル変更を検知して自動的にリビルド＆サーバー再起動が行われます：

```bash
# 開発サーバーを起動（ホットリロード + デバッガー）
pnpm start
```

### デバッガー対応

`--debug` フラグを使用すると、Node.js のインスペクターがポート 9230 で起動します。VS Code などの IDE からアタッチしてデバッグできます。

## 開発体験の改善

**キーワード**: `開発体験`, `ビルド速度`, `テスト速度`, `ホットリロード`, `デバッグ`

このセクションでは、esbuildとVitestによる開発体験の改善について説明します。

### ビルド・テストの劇的な高速化

| 項目           | 従来（tsc + Jest） | 現在（esbuild + Vitest） | 改善率        |
| -------------- | ------------------ | ------------------------ | ------------- |
| ビルド         | 20〜30 秒          | **200〜500 ミリ秒**      | 約 50〜100 倍 |
| テスト起動     | 5〜10 秒           | **500 ミリ秒〜1 秒**     | 約 10〜20 倍  |
| ホットリロード | 非対応             | **対応**                 | -             |

この高速化により、開発中のフィードバックループが劇的に短縮され、開発体験が大幅に向上しています。

## パッケージ管理（pnpm catalog）

**キーワード**: `pnpm`, `catalog`, `バージョン管理`, `pnpm-workspace.yaml`

このセクションでは、pnpm catalogを使用したパッケージバージョンの一元管理方法について説明します。

バージョンを `pnpm-workspace.yaml` で一元管理し、モノレポ全体で統一します。

### 設定例

```yaml
# pnpm-workspace.yaml
versions:
  nestjs: &nestjs 11.0.0
  prisma: &prisma 7.0.0

catalog:
  '@nestjs/core': *nestjs
  '@prisma/client': *prisma
```

```json
// package.json
{
  "dependencies": {
    "@nestjs/core": "catalog:",
    "@prisma/client": "catalog:"
  }
}
```

### バージョンアップ手順

1. `pnpm-workspace.yaml` のバージョンを変更
2. `pnpm install` で全パッケージ一括更新

## 設定ファイル

**キーワード**: `設定ファイル`, `TypeScript`, `ESLint`, `Vitest`, `esbuild`, `NestJS`

このセクションでは、プロジェクトで使用する各種設定ファイルについて説明します。

| ファイル              | 用途                     |
| --------------------- | ------------------------ |
| `tsconfig.json`       | 開発用TypeScript設定     |
| `tsconfig.build.json` | ビルド用TypeScript設定   |
| `tsconfig.spec.json`  | テスト用TypeScript設定   |
| `tsconfig.debug.json` | デバッグ用TypeScript設定 |

### リント・テスト設定

| ファイル            | 用途       |
| ------------------- | ---------- |
| `eslint.config.mjs` | ESLint設定 |
| `vitest.config.ts`  | Vitest設定 |

### NestJS・フレームワーク設定

| ファイル             | 用途              |
| -------------------- | ----------------- |
| `nest-cli.json`      | NestJS CLI設定    |
| `esbuild.config.mjs` | esbuildビルド設定 |
| `turbo.json`         | Turborepo設定     |
