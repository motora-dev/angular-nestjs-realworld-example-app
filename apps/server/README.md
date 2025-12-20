# Server Application

**フレームワーク & ビルド:**</br>
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E.svg?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![esbuild](https://img.shields.io/badge/esbuild-0.25-FFCF00.svg?logo=esbuild)](https://esbuild.github.io/)
[![SWC](https://img.shields.io/badge/SWC-1.11-F8C457.svg)](https://swc.rs/)

**Lint & フォーマット:**</br>
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3.svg?logo=eslint)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3.7-F7B93E.svg?logo=prettier)](https://prettier.io/)

**BaaS・認証:**</br>
[![Supabase](https://img.shields.io/badge/Supabase-2.49-3FCF8E.svg?logo=supabase)](https://supabase.com/)

**データベース:**</br>
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?logo=postgresql)](https://www.postgresql.org/)

**テスト:**</br>
[![Vitest](https://img.shields.io/badge/Vitest-4.0-6E9F18.svg?logo=vitest)](https://vitest.dev/)
[![jsdom](https://img.shields.io/badge/jsdom-27.2-F7DF1E.svg)](https://github.com/jsdom/jsdom)

NestJS + esbuild + swc + Vitest + Prisma + CQRS を採用したバックエンド API です。

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
// 推奨: SWCプラグインでデコレーターメタデータをサポート
// esbuild.config.mjs より抜粋
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
              decoratorMetadata: true, // ここがポイント
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

## 目次

- [ビルドシステム（esbuild + SWC）](#ビルドシステムesbuild--swc)
- [開発体験の改善](#開発体験の改善)
- [設計思想](#設計思想)
- [開発コマンド](#開発コマンド)
- [パッケージ管理（pnpm catalog）](#パッケージ管理pnpm-catalog)
- [ディレクトリ構成](#ディレクトリ構成)
- [アーキテクチャ](#アーキテクチャ)
- [配置基準](#配置基準)
- [CQRS（@nestjs/cqrs）](#cqrsnestjscqrs)
- [データベースアクセス（Prisma）](#データベースアクセスprisma)
- [認証（Supabase Auth）](#認証supabase-auth)
- [エラーハンドリング](#エラーハンドリング)
- [テスト戦略](#テスト戦略)
- [設定ファイル](#設定ファイル)
- [環境変数](#環境変数)

## 設計思想

**キーワード**: `設計原則`, `Vertical Slice Architecture`, `CQRS`, `DDD`, `Repositoryパターン`

このセクションでは、プロジェクトの設計思想と、なぜこの構成を採用したかの理由を説明します。

### なぜこの構成か

1. **Vertical Slice Architecture**: 各ドメインが独立したスライスとして完結し、凝集度が高い
2. **CQRS**: 読み取り（Query）と書き込み（Command）を分離し、責務を明確化
3. **DDD境界の意識**: ドメイン固有のものはドメイン内に、共有するものだけが上位レイヤーに昇格
4. **Repository パターン**: データアクセスを抽象化し、ビジネスロジックとの結合度を下げる

### NestJS公式スタイルガイドとの差異

本構成はNestJS公式スタイルガイドの推奨（機能ごとのモジュール構成）とは一部異なります。これは設計原則（Vertical Slice / Clean Architecture / CQRS）を優先した意図的な選択です。

チームメンバーはこのREADMEを参照し、配置基準を理解した上で開発を行ってください。

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

## ディレクトリ構成

**キーワード**: `ディレクトリ構造`, `domains/`, `modules/`, `shared/`, `Vertical Slice`

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
│       ├── dto/                    # リクエスト/レスポンスDTO
│       ├── repositories/           # データアクセス
│       └── services/               # ビジネスロジック
├── modules/          # (m) 複数ドメイン間で共有するモジュール
│   └── auth/             # 認証モジュール
├── shared/           # (s) 共有リソース
│   ├── adapters/         # 外部サービスアダプター（Prisma, Supabase）
│   ├── decorators/       # カスタムデコレーター
│   ├── exceptions/       # 例外クラス
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
├── dto/                        # リクエスト/レスポンス型
│   └── index.ts
├── repositories/               # データアクセス
│   └── index.ts
└── services/                   # ビジネスロジック
    └── index.ts
```

## アーキテクチャ

**キーワード**: `Vertical Slice Architecture`, `Clean Architecture`, `レイヤー構成`, `依存関係`

このセクションでは、プロジェクト全体のアーキテクチャ設計について説明します。Vertical Slice ArchitectureとClean Architectureを組み合わせた構成を採用しています。

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

## 配置基準

**キーワード**: `ファイル配置`, `配置ルール`, `パスエイリアス`, `命名規則`

このセクションでは、ファイルやコンポーネントをどこに配置すべきかの基準を説明します。詳細は[ディレクトリ構成](#ディレクトリ構成)セクションも参照してください。

### どこに何を置くか

| 対象                       | 配置先                           | 例                                       |
| -------------------------- | -------------------------------- | ---------------------------------------- |
| HTTPエンドポイント         | `domains/{domain}/`              | `domains/article/article.controller.ts`  |
| 読み取りロジック（GET）    | `domains/{domain}/queries/`      | `queries/get-article/`                   |
| 書き込みロジック（POST等） | `domains/{domain}/commands/`     | `commands/create-article/`               |
| リクエスト/レスポンスDTO   | `domains/{domain}/dto/`          | `dto/get-article.dto.ts`                 |
| データアクセス             | `domains/{domain}/repositories/` | `repositories/article.repository.ts`     |
| ビジネスロジック           | `domains/{domain}/services/`     | `services/article.service.ts`            |
| 複数ドメイン共有モジュール | `modules/`                       | `modules/auth/`                          |
| 外部サービスアダプター     | `shared/adapters/`               | `adapters/prisma/prisma.adapter.ts`      |
| カスタムデコレーター       | `shared/decorators/`             | `decorators/public.decorator.ts`         |
| 例外クラス                 | `shared/exceptions/`             | `exceptions/business-logic.exception.ts` |
| 例外フィルター             | `shared/filters/`                | `filters/http-exception.filter.ts`       |
| 認証ガード                 | `shared/guards/`                 | `guards/google-cloud-auth/`              |
| インターセプター           | `shared/interceptors/`           | `interceptors/logging.interceptor.ts`    |
| ユーティリティ関数         | `shared/utils/`                  | `utils/id-generator.ts`                  |

### パスエイリアス

```typescript
import { PrismaAdapter } from '$adapters';
import { Public, CurrentUser } from '$decorators';
import { BusinessLogicError } from '$exceptions';
import { HttpExceptionFilter } from '$filters';
import { AuthService } from '$modules';
```

| エイリアス      | パス                      |
| --------------- | ------------------------- |
| `$adapters`     | `src/shared/adapters`     |
| `$decorators`   | `src/shared/decorators`   |
| `$domains`      | `src/domains`             |
| `$exceptions`   | `src/shared/exceptions`   |
| `$filters`      | `src/shared/filters`      |
| `$guards`       | `src/shared/guards`       |
| `$interceptors` | `src/shared/interceptors` |
| `$modules`      | `src/modules`             |
| `$shared`       | `src/shared`              |
| `$utils`        | `src/shared/utils`        |

### 命名規則

- コントローラー: `{domain}.controller.ts`
- モジュール: `{domain}.module.ts`
- サービス: `{domain}.service.ts`
- リポジトリ: `{domain}.repository.ts`
- DTO: `{action}.dto.ts`
- Query: `{action}.query.ts`
- Command: `{action}.command.ts`
- Handler: `{action}.handler.ts`
- テスト: `{name}.test.ts`

## CQRS（@nestjs/cqrs）

**キーワード**: `CQRS`, `Command`, `Query`, `Handler`, `@nestjs/cqrs`

このセクションでは、CQRSパターンを使用した読み取りと書き込みの責務分離について説明します。

**関連ファイル**:
- `apps/server/src/domains/{domain}/queries/{action}/{action}.query.ts` - Query定義
- `apps/server/src/domains/{domain}/queries/{action}/{action}.handler.ts` - QueryHandler実装
- `apps/server/src/domains/{domain}/commands/{action}/{action}.command.ts` - Command定義
- `apps/server/src/domains/{domain}/commands/{action}/{action}.handler.ts` - CommandHandler実装

### 設計原則

CQRS（Command Query Responsibility Segregation）パターンにより、読み取りと書き込みの責務を分離します。

#### Query（読み取り）

データの取得のみを行い、状態を変更しません。

```typescript
// 推奨: Queryは状態を変更しない
// queries/get-article-list/get-article-list.query.ts
export class GetArticleListQuery {
  public constructor() {}
}
```

```typescript
// 推奨: QueryHandlerはデータ取得のみを行う
// queries/get-article-list/get-article-list.handler.ts
@QueryHandler(GetArticleListQuery)
export class GetArticleListHandler implements IQueryHandler<GetArticleListQuery> {
  constructor(private readonly articleListService: ArticleListService) {}

  async execute(): Promise<ArticleListDto> {
    return await this.articleListService.getArticleList();
  }
}
```

#### Command（書き込み）

状態を変更する操作を行います。

```typescript
// 推奨: Commandは状態を変更する操作を表す
// commands/create-article/create-article.command.ts
export class CreateArticleCommand {
  constructor(
    public readonly title: string,
    public readonly content: string,
  ) {}
}
```

```typescript
// 推奨: CommandHandlerは状態を変更する処理を実行する
// commands/create-article/create-article.handler.ts
@CommandHandler(CreateArticleCommand)
export class CreateArticleHandler implements ICommandHandler<CreateArticleCommand> {
  constructor(private readonly articleService: ArticleService) {}

  async execute(command: CreateArticleCommand): Promise<void> {
    await this.articleService.createArticle(command.title, command.content);
  }
}
```

### Controller での使用

```typescript
// 推奨: ControllerでQueryBus/CommandBusを使用してCQRSパターンを実現
@Controller('article-list')
export class ArticleListController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
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
// 推奨: ESModule環境ではformat: 'esm'とreflect-metadataのバナーを設定
// esbuild.config.mjs より
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
// 推奨: PrismaAdapterを使用してPrisma ClientをNestJSのライフサイクルに統合
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
// 推奨: Repositoryパターンでデータアクセスを抽象化
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

## 認証（Supabase Auth）

**キーワード**: `認証`, `Supabase Auth`, `JWT`, `Guard`, `デコレーター`

このセクションでは、Supabase Authを使用した認証の実装パターンについて説明します。

**関連ファイル**:
- `apps/server/src/shared/guards/supabase-auth.guard.ts` - SupabaseAuthGuard実装
- `apps/server/src/shared/decorators/public.decorator.ts` - @Publicデコレーター
- `apps/server/src/shared/decorators/current-user.decorator.ts` - @CurrentUserデコレーター

### SupabaseAuthGuard

Supabase の JWT トークンを検証し、ユーザー情報をリクエストに付与します。

```typescript
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    const accessToken = req.cookies['sb-access-token'];
    if (!accessToken) {
      throw new BusinessLogicError(ERROR_CODE.UNAUTHORIZED);
    }

    // JWT を検証
    const { data: userData, error } = await supabase.auth.getUser(accessToken);
    if (error) {
      throw new BusinessLogicError(ERROR_CODE.UNAUTHORIZED, error.message);
    }

    // ユーザー情報をリクエストに付与
    req.user = {
      id: user?.id ?? 0,
      publicId: user?.publicId ?? 'unknown',
    };

    return true;
  }
}
```

### @Public デコレーター

認証をバイパスするエンドポイントに使用します。

```typescript
// 推奨: 認証不要なエンドポイントに@Publicデコレーターを使用
// shared/decorators/public.decorator.ts
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

```typescript
// 推奨: 認証不要なエンドポイントに@Publicデコレーターを付与
// 使用例
@Public()
@Get('article-list')
async getArticleList() { ... }
```

### @CurrentUser デコレーター

認証済みユーザー情報を取得するデコレーターです。

```typescript
// 推奨: @CurrentUserデコレーターで認証済みユーザー情報を取得
// shared/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
```

```typescript
// 推奨: 認証済みユーザー情報が必要なエンドポイントで@CurrentUserを使用
// 使用例
@Post('article')
async createArticle(@CurrentUser() user: User) { ... }
```

## エラーハンドリング

**キーワード**: `エラーハンドリング`, `BusinessLogicError`, `HttpExceptionFilter`, `例外処理`, `エラーレスポンス`

このセクションでは、APIエラーやビジネスロジックエラーの処理方法について説明します。

**関連ファイル**:
- `apps/server/src/shared/exceptions/business-logic.exception.ts` - BusinessLogicError実装
- `apps/server/src/shared/filters/http-exception.filter.ts` - HttpExceptionFilter実装

### BusinessLogicError

ビジネスロジック層で発生するエラーを表すカスタム例外クラスです。

```typescript
// 推奨: BusinessLogicErrorでビジネスロジックエラーを表現
// shared/exceptions/business-logic.exception.ts
export class BusinessLogicError extends Error {
  public readonly errorCode: ErrorCode;
  public readonly statusCode: number;

  constructor(errorObject: ErrorCodeObject, message?: string) {
    super(message || errorObject.message);
    this.errorCode = errorObject.code;
    this.statusCode = errorObject.statusCode;
  }
}
```

```typescript
// 推奨: ビジネスロジックエラーはBusinessLogicErrorを使用
// 使用例
throw new BusinessLogicError(ERROR_CODE.UNAUTHORIZED);
throw new BusinessLogicError(ERROR_CODE.NOT_FOUND, 'Article not found');
```

### HttpExceptionFilter

すべての例外をキャッチし、統一されたレスポンス形式に変換します。

```typescript
// 推奨: HttpExceptionFilterで全例外を統一された形式に変換
// shared/filters/http-exception.filter.ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // BusinessLogicError / HttpException / その他のエラーを処理
    // 統一されたJSONレスポンスを返却
    response.status(status).json({
      path: request.url,
      errorCode,
      message,
    });
  }
}
```

### エラーレスポンス形式

```json
{
  "path": "/api/article/123",
  "errorCode": "NOT_FOUND",
  "message": "Article not found"
}
```

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
// vitest.config.ts より抜粋
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

テストファイルは対象ファイルと同じディレクトリに配置します。

```
domains/article-list/
├── article-list.controller.ts
├── article-list.controller.test.ts    # コントローラーテスト
├── article-list.module.ts
├── article-list.module.test.ts        # モジュールテスト
└── queries/
    └── get-article-list/
        ├── get-article-list.query.ts
        └── get-article-list.query.test.ts
```

### 命名規則

- ユニットテスト: `{name}.test.ts`
- E2Eテスト: `{name}.spec.ts`

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

## 環境変数

**キーワード**: `環境変数`, `.env`, `データベース`, `Supabase`, `CORS`

このセクションでは、プロジェクトで必要な環境変数とその設定方法について説明します。

| 変数名                      | 説明                                      | 例                                   | 必須   |
| --------------------------- | ----------------------------------------- | ------------------------------------ | ------ |
| `DATABASE_URL`              | PostgreSQLデータベースURL（接続プール用） | `postgresql://postgres:pass@host/db` | はい   |
| `DIRECT_URL`                | PostgreSQLデータベースURL（直接接続用）   | `postgresql://postgres:pass@host/db` | はい   |
| `SUPABASE_URL`              | SupabaseプロジェクトのURL                 | `https://xxx.supabase.co`            | はい   |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseサービスロールキー                | `eyJ0eXAiOiJKV1Q...`                 | はい   |
| `CORS_ORIGINS`              | CORS許可オリジン（カンマ区切り）          | `http://localhost:4200`              | はい   |
| `PORT`                      | サーバーポート番号                        | `3000`                               | いいえ |

### 環境変数の設定

```bash
# .env.exampleをコピー
cp .env.example .env

# エディタで.envを編集し、実際の値を設定
```
