# Client Application

**フレームワーク & ビルド:**</br>
[![Angular](https://img.shields.io/badge/Angular-21-DD0031.svg?logo=angular)](https://angular.dev/)
[![Angular CDK](https://img.shields.io/badge/Angular_CDK-21-DD0031.svg?logo=angular)](https://material.angular.io/cdk/categories)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![esbuild](https://img.shields.io/badge/esbuild-@angular/build-FFCF00.svg?logo=esbuild)](https://angular.dev/tools/cli/build-system-migration)

**Lint & フォーマット:**</br>
[![ESLint](https://img.shields.io/badge/ESLint-9.39-4B32C3.svg?logo=eslint)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3.7-F7B93E.svg?logo=prettier)](https://prettier.io/)

**SSR:**</br>
[![SSR](https://img.shields.io/badge/SSR-Enabled-4CAF50.svg)](https://angular.dev/guide/ssr)
[![ISR](https://img.shields.io/badge/ISR-@rx--angular-E91E63.svg)](https://www.rx-angular.io/docs/isr)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?logo=express)](https://expressjs.com/)

**状態管理 & リアクティブ:**</br>
[![NGXS](https://img.shields.io/badge/NGXS-20-3F51B5.svg)](https://www.ngxs.io/)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C.svg?logo=reactivex)](https://rxjs.dev/)
[![RxAngular](https://img.shields.io/badge/RxAngular-20.1-E91E63.svg)](https://www.rx-angular.io/)

**スタイリング:**</br>
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![PostCSS](https://img.shields.io/badge/PostCSS-8.5-DD3A0A.svg?logo=postcss)](https://postcss.org/)
[![CVA](https://img.shields.io/badge/CVA-0.7-7C3AED.svg)](https://cva.style/)
[![clsx](https://img.shields.io/badge/clsx-2.1-06B6D4.svg)](https://github.com/lukeed/clsx)
[![tailwind-merge](https://img.shields.io/badge/tailwind--merge-3.4-06B6D4.svg)](https://github.com/dcastil/tailwind-merge)

**テスト & UIカタログ:**</br>
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF.svg?logo=vite)](https://vite.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-4.0.14-6E9F18.svg?logo=vitest)](https://vitest.dev/)
[![Testing Library](https://img.shields.io/badge/Testing_Library-18.1-E33332.svg?logo=testinglibrary)](https://testing-library.com/)
[![jsdom](https://img.shields.io/badge/jsdom-27.2-F7DF1E.svg)](https://github.com/jsdom/jsdom)
[![Storybook](https://img.shields.io/badge/Storybook-10.1-FF4785.svg?logo=storybook)](https://storybook.js.org/)

Angular 21 + Tailwind CSS 4 + SSR を採用したフロントエンドアプリケーションです。

## 目次

### 実装パターン（よく使う情報）
- [開発コマンド](#開発コマンド)
- [ディレクトリ構成](#ディレクトリ構成)
- [配置基準](#配置基準)
- [状態管理（NGXS）](#状態管理ngxs)
- [リアクティブパターンの使い分け](#リアクティブパターンの使い分け)
- [フォーム管理](#フォーム管理)
- [国際化（i18n）](#国際化i18n)
- [UI アーキテクチャ](#ui-アーキテクチャ)
- [エラーハンドリング](#エラーハンドリング)
- [スピナー（Spinner）](#スピナーspinner)
- [スナックバー（Snackbar）](#スナックバーsnackbar)

### 背景知識・設定
- [アーキテクチャ](#アーキテクチャ)
- [設計思想](#設計思想)
- [パフォーマンス最適化](#パフォーマンス最適化)
- [パッケージ管理（pnpm catalog）](#パッケージ管理pnpm-catalog)

### 補助情報
- [テスト戦略](#テスト戦略)
- [Storybook](#storybook)

## 設計思想

**キーワード**: `設計原則`, `Vertical Slice`, `DDD`, `Facadeパターン`, `shadcn/ui`

このセクションでは、プロジェクトの設計思想と、なぜこの構成を採用したかの理由を説明します。詳細は[アーキテクチャ](#アーキテクチャ)セクションも参照してください。

### なぜこの構成か

1. **アルファベット順の一貫性**: `app → components → domains → modules → shared` の順で視覚的に整理
2. **Vertical Slice**: 各ページが独立したスライスとして完結し、凝集度が高い
3. **DDD境界の意識**: ページ固有のものはページ内に、共有するものだけが上位レイヤーに昇格
4. **shadcn/uiアプローチ**: `shared/ui/` にUIプリミティブを配置し、コピー＆カスタマイズ可能な構成
5. **Facade パターン**: Store へのアクセスを抽象化し、コンポーネントとの結合度を下げる

### Angular公式スタイルガイドとの差異

本構成はAngular公式スタイルガイドの推奨（機能ごとのディレクトリ構成）とは一部異なります。これは設計原則（Vertical Slice / Clean Architecture）を優先した意図的な選択です。

チームメンバーはこのREADMEを参照し、配置基準を理解した上で開発を行ってください。

## 開発コマンド

**キーワード**: `pnpm`, `開発サーバー`, `ビルド`, `テスト`, `Lint`, `Storybook`

このセクションでは、プロジェクトで使用する主要な開発コマンドを説明します。

```bash
# 完全クリーンアップ（node_modulesも削除）
pnpm clean

# キャッシュクリア（.angular, .turbo, coverage, dist）
pnpm clean:cache

# 開発サーバー起動
pnpm start

# ビルド
pnpm build

# SSR サーバー起動
pnpm serve:ssr:client

# テスト
pnpm test

# Lint
pnpm lint

# Storybook 起動
pnpm storybook

# Storybook ビルド
pnpm build-storybook
```

## パッケージ管理（pnpm catalog）

**キーワード**: `pnpm`, `catalog`, `バージョン管理`, `pnpm-workspace.yaml`

このセクションでは、pnpm catalogを使用したパッケージバージョンの一元管理方法について説明します。

バージョンを `pnpm-workspace.yaml` で一元管理し、モノレポ全体で統一します。

### 設定例

```yaml
# ファイル: pnpm-workspace.yaml（ルートディレクトリ）
versions:
  angular: &angular 21.0.0
  ngxs: &ngxs 20.1.0

catalog:
  '@angular/core': *angular
  '@ngxs/store': *ngxs
```

```json
// ファイル: apps/client/package.json
{
  "dependencies": {
    "@angular/core": "catalog:",
    "@ngxs/store": "catalog:"
  }
}
```

### バージョンアップ手順

1. `pnpm-workspace.yaml` のバージョンを変更
2. `pnpm install` で全パッケージ一括更新

## ディレクトリ構成

**キーワード**: `ディレクトリ構造`, `app/`, `components/`, `domains/`, `modules/`, `shared/`

このセクションでは、プロジェクトのディレクトリ構成と各ディレクトリの役割を説明します。

```
src/
├── app/              # (a) ルートコンポーネント + 各ページ
│   ├── app.ts            # ルートコンポーネント
│   ├── app.config.ts     # アプリケーション設定
│   ├── app.routes.ts     # ルーティング定義
│   └── {page}/           # 各ページ（Vertical Slice）
│       ├── {page}.ts         # 親コンポーネント（Facade、RxLet）
│       ├── {page}.html       # レイアウト + サブコンポーネント呼び出し
│       ├── {page}.routes.ts  # ルーティング定義
│       └── components/       # ページ固有サブコンポーネント
│           └── {name}/
├── components/       # (c) 複数ページで共有するコンポーネント（Composed UI）
├── domains/          # (d) ドメインロジック + 状態管理（NGXS）
├── modules/          # (m) app/components/domains間で共有するロジック
├── shared/           # (s) 共有リソース
│   ├── lib/              # ユーティリティ関数
│   └── ui/               # UIプリミティブ（shadcn/ui相当）
├── main.ts
└── index.html
```

### ページコンポーネントの標準パターン

各ページは **親コンポーネント + サブコンポーネント** の構成を標準とします。

```
app/{page}/
├── {page}.ts              # 親（Facade提供、RxLet、Input/Output連携）
├── {page}.html            # レイアウト + サブコンポーネント呼び出し
├── {page}.routes.ts       # ルーティング定義
├── index.ts
└── components/            # ページ固有サブコンポーネント
    ├── index.ts
    └── {name}/
        ├── {name}.ts
        ├── {name}.html
        └── index.ts
```

**責務分離:**

- **親コンポーネント**: Facade の提供、Observable の購読（`*rxLet`）、サブコンポーネントへの Input/Output 連携
- **サブコンポーネント**: Input で受け取ったデータの表示のみ（Presentational）

**例:**

```typescript
// ファイル: apps/client/src/app/article-list/article-list.ts
// 親コンポーネントの実装例
@Component({
  imports: [RxLet, ArticleListContentComponent],
  providers: [ArticleListFacade],
})
export class ArticleListComponent {
  private readonly facade = inject(ArticleListFacade);
  readonly articleList$ = this.facade.articleList$;
}
```

```html
<!-- ファイル: apps/client/src/app/article-list/article-list.html -->
<!-- 親テンプレートの実装例 -->
<ng-container *rxLet="articleList$; let articles">
  <app-article-list-content [articles]="articles" />
</ng-container>
```

```typescript
// ファイル: apps/client/src/app/article-list/components/article-list-content/article-list-content.ts
// サブコンポーネントの実装例
@Component({ ... })
export class ArticleListContentComponent {
  readonly articles = input.required<Article[]>();
}
```

### ライフサイクルフック

モダン Angular（`inject()` + Signal）では `ngOnInit` は使用せず、**constructor** で初期化を行います。

```typescript
// 推奨: constructor で初期化
@Component({ ... })
export class ArticleListComponent {
  private readonly facade = inject(ArticleListFacade);
  readonly articleList$ = this.facade.articleList$;

  constructor() {
    this.facade.loadArticleList();
  }
}

// ❌ ngOnInit は使わない
export class ArticleListComponent implements OnInit {
  ngOnInit(): void {
    this.facade.loadArticleList();
  }
}
```

**理由:**

- `inject()` は constructor injection context で動作
- Signal inputs (`input()`) は constructor 時点で利用可能
- `ActivatedRoute.snapshot` も constructor で取得可能
- コードがシンプルになる

## アーキテクチャ

**キーワード**: `Vertical Slice Architecture`, `Clean Architecture`, `レイヤー構成`, `依存関係`

このセクションでは、プロジェクト全体のアーキテクチャ設計について説明します。Vertical Slice ArchitectureとClean Architectureを組み合わせた構成を採用しています。

詳細は[設計思想](#設計思想)セクションも参照してください。

### レイヤー構成

| ディレクトリ  | レイヤー              | 責務                                             | 状態   |
| ------------- | --------------------- | ------------------------------------------------ | ------ |
| `app/`        | Presentation          | ページ・ルーティング・UI表示                     | 使用中 |
| `components/` | Presentation (Shared) | 複数ページで共有するUIコンポーネント             | 使用中 |
| `domains/`    | Domain + Application  | エンティティ・状態管理（NGXS）・ビジネスロジック | 使用中 |
| `modules/`    | Application           | app/components/domains間で共有するロジック       | 使用中 |
| `shared/`     | Infrastructure        | ユーティリティ・UIプリミティブ・アダプター       | 使用中 |

### 依存関係のルール

```
app/ ──→ components/ ──→ domains/ ──→ modules/ ──→ shared/
```

- 上位レイヤーは下位レイヤーに依存できる（右方向への依存のみ許可）
- 下位レイヤーは上位レイヤーに依存してはならない（左方向への依存は禁止）
- `shared/` は全レイヤーから参照可能

## 配置基準

**キーワード**: `ファイル配置`, `配置ルール`, `パスエイリアス`, `命名規則`

このセクションでは、ファイルやコンポーネントをどこに配置すべきかの基準を説明します。詳細は[ディレクトリ構成](#ディレクトリ構成)セクションも参照してください。

### どこに何を置くか

| 対象                         | 配置先                    | 例                                   |
| ---------------------------- | ------------------------- | ------------------------------------ |
| ルーティング対象のページ     | `app/{page}/`             | `app/home/home.ts`                   |
| ページ固有のUI部品           | `app/{page}/templates/`   | `app/home/templates/hero-section.ts` |
| 複数ページで共有するUI       | `components/`             | `components/fields/input-field/`     |
| Composed UI（ロジック連携）  | `components/`             | `components/fields/input-field/`     |
| 状態管理（NGXS State）       | `domains/{domain}/store/` | `domains/home/store/home.state.ts`   |
| Facade                       | `domains/{domain}/`       | `domains/home/home.facade.ts`        |
| ビジネスロジック             | `domains/{domain}/`       | `domains/user/user.service.ts`       |
| app/components/domains間共有 | `modules/`                | `modules/ui/ui.facade.ts`            |
| UIプリミティブ（最小単位）   | `shared/ui/`              | `shared/ui/button/button.ts`         |
| ユーティリティ関数           | `shared/lib/`             | `shared/lib/utils.ts`                |

### パスエイリアス

```typescript
import { ButtonDirective } from '$shared/ui';
import { cn } from '$shared/lib';
import { HomeFacade } from '$domains/home';
import { InputFieldComponent } from '$components/fields';
```

| エイリアス      | パス               |
| --------------- | ------------------ |
| `$app/*`        | `src/app/*`        |
| `$components/*` | `src/components/*` |
| `$domains/*`    | `src/domains/*`    |
| `$modules/*`    | `src/modules/*`    |
| `$shared/*`     | `src/shared/*`     |

### 命名規則

- コンポーネント: `{name}.ts`（単一ファイルコンポーネント）
- テンプレート: `{name}.html`（必要な場合のみ分離）
- スタイル: `{name}.css`（必要な場合のみ分離）
- テスト: `{name}.spec.ts` または `{name}.test.ts`

## 状態管理（NGXS）

**キーワード**: `NGXS`, `状態管理`, `Facade`, `Store`, `Action`, `Selector`

このセクションでは、NGXSを使用した状態管理のパターンについて説明します。Facadeパターンによる責務分離と、Storeの状態更新方法を中心に解説します。

**関連ファイル**:
- `apps/client/src/domains/{domain}/{domain}.facade.ts` - Facade実装
- `apps/client/src/domains/{domain}/store/{domain}.state.ts` - State定義
- `apps/client/src/domains/{domain}/store/{domain}.actions.ts` - Action定義

### ドメイン構造

```
domains/{domain}/
├── api/
│   ├── {domain}.api.ts          # API呼び出し（内部）
│   ├── {domain}.response.ts     # APIレスポンス型（内部）
│   └── index.ts
├── model/
│   ├── {domain}.model.ts        # State/UI用モデル（公開）
│   └── index.ts
├── store/
│   ├── {domain}.state.ts        # State定義 + Selector（内部）
│   ├── {domain}.actions.ts      # Action定義（内部）
│   └── index.ts
├── {domain}.facade.ts           # API呼び出し + Store操作（公開）
└── index.ts                     # model と facade のみエクスポート
```

### 設計原則

#### 1. app/ と domains/ の命名統一

`app/` のページディレクトリと `domains/` のドメインディレクトリは **同じ名前**で統一します。

```
app/
  article-list/     ← 記事一覧ページ
  article-page/     ← 記事詳細ページ

domains/
  article-list/     ← 記事一覧ドメイン
  article-page/     ← 記事詳細ドメイン
```

また、ドメイン内のファイル名・型名も統一します。

```
domains/article-page/
  api/article-page.api.ts           # ArticlePageApi
  api/article-page.response.ts      # ArticlePageResponse
  model/article-page.model.ts       # ArticlePage, ArticlePageItem
  store/article-page.actions.ts     # SetArticlePage, SetArticlePageItems
  store/article-page.state.ts       # ArticlePageState
  article-page.facade.ts            # ArticlePageFacade
```

**メリット:**

- どのページがどのドメインを使うか一目瞭然
- `ArticlePage` で検索すれば関連ファイルが全てヒット
- 新しいメンバーも迷わない

#### 2. 公開範囲の制限

`index.ts` では **model と facade のみ**をエクスポートし、`api` と `store` は内部実装として隠蔽します。

```typescript
// domains/article-list/index.ts
export * from './model'; // ✅ 公開
export * from './article-list.facade'; // ✅ 公開
// api/ と store/ はエクスポートしない
```

**メリット:**

- 外部から使うべきものが明確
- 内部実装の変更が外部に影響しない
- 認知負荷の軽減

#### 3. APIモデルとStateモデルの分離

API レスポンスの型と State で使用する型は別々に定義します。

```typescript
// api/article-list.response.ts（内部で隠蔽）
export interface ArticleResponse {
  id: string;
  createdAt: string; // APIはstringで返す
}

// model/article-list.model.ts（外部に公開）
export interface Article {
  id: string;
  createdAt: Date; // アプリ内ではDateで扱う
}
```

**メリット:**

- API の形式変更が State/UI 層に影響しない
- 変換ロジックを Facade に集約

#### 4. Facade パターンによる責務分離

一般的な「State 内で API を呼び出す」パターンではなく、**Facade 内で API 呼び出しと Store 操作を結合**します。

```typescript
// 非推奨: State内でAPI呼び出し（密結合）
@Action(LoadArticleList)
loadArticleList(ctx) {
  return this.api.getArticleList().pipe(
    tap((res) => ctx.dispatch(new LoadArticleListSuccess(res))),
    catchError((err) => ctx.dispatch(new LoadArticleListFailure(err))),
  );
}

// 推奨: Facade内でAPI呼び出し + Store操作
loadArticleList(): void {
  this.api.getArticleList().subscribe((response) => {
    const articles: Article[] = response.articleList.map((r) => ({
      id: r.id,
      title: r.title,
      createdAt: new Date(r.createdAt),
    }));
    this.store.dispatch(new SetArticleList(articles));
  });
}
```

**メリット:**

- State は純粋なデータ保持のみ（get/set）
- API と Store の密結合を解消
- Action 名が対照的で分かりやすい（`getArticleList` / `setArticleList`）

#### 5. エラーハンドリングの共通化

`loading` / `error` 状態は各ドメインでは実装せず、共通処理で対応します。

- **Interceptor**: HTTP エラーをキャッチし、通知ドメインへ連携
- **通知ドメイン**: Toast 表示などの UI フィードバック

```typescript
// 非推奨: 各ドメインで loading/error を管理しない
interface ArticleListStateModel {
  articleList: Article[];
  loading: boolean; // 不要
  error: string; // 不要
}

// ✅ データのみ保持
interface ArticleListStateModel {
  articleList: Article[];
}
```

### Facade の使用例

```typescript
// Facadeの使用例（コンポーネントから）
private readonly facade = inject(ArticleListFacade);
readonly articleList$ = this.facade.articleList$;

constructor() {
  this.facade.loadArticleList();
}
```

### フォーム連携（@ngxs/form-plugin）

Reactive Forms と NGXS Store を自動同期します。詳細は[フォーム管理](#フォーム管理)セクションも参照してください。

```html
<form [formGroup]="form" ngxsForm="domain.formPath">
  <input formControlName="text" />
</form>
```

State に `textForm` を定義すると、フォームの値が自動的に Store に同期されます。

### 状態更新パターン

NGXS Storeの状態更新では、以下のパターンを使用します：

- **使用するメソッド**: `ctx.setState()`と`patch`オペレーター（`@ngxs/store/operators`）
- **使用しないメソッド**: `ctx.patchState()`は使用しない

実装例:

```typescript
// ファイル: apps/client/src/domains/article-edit/store/article-edit.state.ts
// 状態更新パターンの実装例
@Action(SetArticle)
setArticle(ctx: StateContext<ArticleEditStateModel>, action: SetArticle) {
  ctx.setState(
    patch({
      articleForm: patch({
        model: patch({
          ...action.article,
        }),
      }),
    }),
  );
}
```

## リアクティブパターンの使い分け

**キーワード**: `Signal`, `Observable`, `NGXS`, `RxLet`, `Reactive Forms`, `@ngxs/form-plugin`

このセクションでは、Signal、Observable、NGXS、Reactive Formsなどのリアクティブパターンの使い分けを説明します。

| スコープ       | 技術                              | 用途                       | 例                         |
| -------------- | --------------------------------- | -------------------------- | -------------------------- |
| ローカル状態   | **Signal**                        | コンポーネント内部         | `signal()`, `computed()`   |
| グローバル状態 | **NGXS + `*rxLet`**               | domains連携、大規模データ  | `facade.data$` + `*rxLet`  |
| フォーム       | **Reactive Forms + form-plugin**  | バリデーション + Store同期 | `ngxsForm`                 |
| テンプレート   | **RxLet**（AsyncPipe は使わない） | Observable の描画          | `*rxLet="data$; let data"` |

### 使い分けの指針

- **shared/ui/, components/**: 内部実装は Signal を使用
- **domains との連携**: NGXS Store + `*rxLet` で Observable を描画（詳細は[状態管理（NGXS）](#状態管理ngxs)セクションを参照）
- **フォーム**: Reactive Forms でバリデーション、@ngxs/form-plugin で Store 同期（詳細は[フォーム管理](#フォーム管理)セクションを参照）
- **テンプレートでの Observable**: `AsyncPipe` は使わず、必ず `RxLet` を使用

## フォーム管理

**キーワード**: `Reactive Forms`, `@ngxs/form-plugin`, `バリデーション`, `InputFieldComponent`, `親子コンポーネント連携`

このセクションでは、Reactive FormsとNGXS Storeを連携したフォーム管理パターンについて説明します。親子コンポーネントでの連携方法や、トップダウンバリデーション戦略も含みます。

**関連ファイル**:
- `apps/client/src/app/article-edit/components/edit-form/edit-form.ts` - フォームコンポーネント例
- `apps/client/src/components/fields/input-field/input-field.ts` - InputFieldComponent実装

### 技術構成

| 技術                | 役割                                         |
| ------------------- | -------------------------------------------- |
| Reactive Forms      | バリデーション（`required`, `minLength` 等） |
| @ngxs/form-plugin   | Store との自動同期                           |
| InputFieldComponent | エラー表示の共通化                           |

### InputFieldComponent の使用

**ファイル**: `apps/client/src/components/fields/input-field/input-field.ts`

```html
<app-input-field label="ユーザー名" [control]="form.controls.username">
  <input appInput formControlName="username" />
</app-input-field>
```

機能:
- ラベル表示
- バリデーションエラーの自動表示
- エラー状態のスタイル適用

## 国際化（i18n）

**キーワード**: `i18n`, `国際化`, `ja.json`, `翻訳`, `エラーコード`

このセクションでは、HTML上で表示される文言の管理方法と、ja.jsonの構造ルールについて説明します。

**関連ファイル**:
- `apps/client/public/i18n/ja.json` - 日本語翻訳ファイル

### ルール

HTML上で表示される文言は`apps/client/public/i18n/ja.json`で定義します。

### ja.jsonの構造ルール

- **エラーコード（`errorCodes`）**: 最下部に配置
- **それ以外のキー**: アルファベット順で配置

例:

```json
{
  "articleEdit": {
    "title": "記事設定",
    "form": {
      "titleLabel": "タイトル",
      "saveButton": "保存"
    }
  },
  "errorCodes": {
    "E-999": "予期しないエラーが発生しました"
  }
}
```

### フォーム管理パターン（親子コンポーネント連携）

article-editで使用しているフォーム管理パターン：

- **親コンポーネント**: Facadeの呼び出し、`isFormInvalid$`と`isFormDirty$`をFacade経由で取得
- **子コンポーネント**: `FormGroup`を定義し、`ngxsForm`ディレクティブでNGXS Storeと連携
- **保存アクション**: 親コンポーネント側で定義（`onSave()`メソッド）
- **URLパラメータのバリデーション**: URLパラメータもStoreに保存し、FormsのValidatorsを利用することで同時にvalidateを実施

実装例:

```typescript
// ファイル: apps/client/src/app/article-edit/article-edit.ts
// 親コンポーネントの実装例
@Component({ ... })
export class ArticleEditComponent {
  private readonly facade = inject(ArticleEditFacade);
  readonly isFormInvalid$ = this.facade.isFormInvalid$;
  readonly isFormDirty$ = this.facade.isFormDirty$;

  onSave(): void {
    const form = this.editForm()?.form;
    if (!form || form.invalid) return;
    // 保存処理
  }
}
```

```typescript
// ファイル: apps/client/src/app/article-edit/components/edit-form/edit-form.ts
// 子コンポーネントの実装例
@Component({ ... })
export class EditFormComponent {
  readonly form = this.fb.nonNullable.group({
    articleId: ['', [Validators.required]],
    title: ['', [Validators.required]],
    // ...
  });
}
```

```html
<!-- ファイル: apps/client/src/app/article-edit/components/edit-form/edit-form.html -->
<!-- 子コンポーネントテンプレートの実装例 -->
<form [formGroup]="form" ngxsForm="articleEdit.articleForm">
  <input formControlName="title" />
</form>
```

### バリデーション戦略（トップダウンバリデーション）

**トップダウンバリデーション**を採用しています：

- **バリデーション対象**: ユーザー入力（フォーム）のみ
- **バリデーション対象外**: APIレスポンス、Storeのデータ
- **メリット**: 必要最小限のバリデーションで高い保守性・拡張性を実現

**実装方針**:

- APIからのレスポンスやストアには直接Zodを使わず、コンポーネントからの入力にのみValidateをかける
- Reactive Formsの`Validators`を使用（`required`、`minLength`など）

```typescript
// 推奨: フォームでバリデーション
readonly form = this.fb.nonNullable.group({
  title: ['', [Validators.required, Validators.minLength(1)]],
});

// 非推奨: APIレスポンスやStoreのデータにはバリデーションをかけない
interface ArticleResponse {
  id: string;
  title: string; // バリデーション不要
}
```

## UI アーキテクチャ

**キーワード**: `UIプリミティブ`, `Composed UI`, `shared/ui/`, `components/`, `shadcn/ui`

このセクションでは、UIプリミティブとComposed UIの違い、配置場所の基準について説明します。

### Primitives vs Composed

| 種類           | 配置先        | 責務                       | パッケージ化       |
| -------------- | ------------- | -------------------------- | ------------------ |
| **Primitives** | `shared/ui/`  | スタイリングのみ、状態なし | 可能               |
| **Composed**   | `components/` | ロジック連携、状態あり     | このリポジトリ固有 |

**Primitives（shared/ui/）**:

- `ButtonDirective` - ボタンスタイル
- `InputDirective` - 入力フィールドスタイル
- 外部パッケージ化可能、依存なし

**Composed（components/）**:

- `InputFieldComponent` - Reactive Forms連携、エラー表示
- このリポジトリ固有のロジックを含む

## エラーハンドリング

**キーワード**: `エラーハンドリング`, `HttpInterceptor`, `ErrorFacade`, `ErrorHandler`, `エラーダイアログ`, `ページ遷移`

このセクションでは、APIエラーやクライアントエラーの処理方法について説明します。HttpInterceptorによるエラー集約と、ErrorHandlerによるページ遷移の実装パターンを解説します。

**関連ファイル**:
- `apps/client/src/domains/interceptors/http-error.interceptor.ts` - HTTPエラーインターセプター
- `apps/client/src/domains/error-handlers/client-error.handler.ts` - クライアントエラーハンドラー
- `apps/client/src/modules/error/error.facade.ts` - ErrorFacade実装

### 主な利用例

- **APIのエラー**: HTTPリクエスト時のエラー（400, 500など）
- **クライアントから発生するエラー**: コンポーネント内で発生するエラー（NotFoundErrorなど）

### 実装パターン

#### API呼び出し時のエラー

`HttpInterceptor`（`apps/client/src/domains/interceptors/http-error.interceptor.ts`）でエラーを集約し、`ErrorFacade.showError()`経由でエラーダイアログを表示します。

- 401/403/404はダイアログ表示せず、`ErrorHandler`でページ遷移
- その他のエラー（400, 500など）はエラーダイアログで表示

#### ErrorHandlerでのページ遷移

`ClientErrorHandler`（`apps/client/src/domains/error-handlers/client-error.handler.ts`）で401/403/404エラーをキャッチし、エラーページに遷移します。

- エラーページ: `/error/401`、`/error/403`、`/error/404`
- `skipLocationChange: true`でURLは元のまま

実装例:

```typescript
// ファイル: apps/client/src/domains/interceptors/http-error.interceptor.ts
// HttpInterceptorでエラーをキャッチする実装例
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((e: HttpErrorResponse) => {
      // 401/403/404はスキップ → ErrorHandlerで処理
      if ([401, 403, 404].includes(e.status)) {
        return throwError(() => e);
      }
      // その他のエラーはダイアログ表示
      errorFacade.showError(apiError);
      return throwError(() => e);
    }),
  );
};
```

```typescript
// ファイル: apps/client/src/domains/error-handlers/client-error.handler.ts
// ErrorHandlerでページ遷移する実装例
handleError(error: unknown): void {
  if (error instanceof HttpErrorResponse) {
    const route = PAGE_NAVIGATE_ROUTES[error.status];
    if (route) {
      this.router.navigate([route], { skipLocationChange: true });
    }
  }
}
```

## スピナー（Spinner）

**キーワード**: `Spinner`, `ローディング`, `SpinnerFacade`, `withSpinner`, `API呼び出し`

このセクションでは、API呼び出し時にSpinnerを表示する方法について説明します。

**関連ファイル**:
- `apps/client/src/modules/spinner/spinner.facade.ts` - SpinnerFacade実装

### 主な利用例

- **API呼び出し時のロック**: APIリクエスト中にユーザー操作をロックし、処理中であることを視覚的に示す

### 実装パターン

API呼び出し時は`SpinnerFacade.withSpinner()`を使用してSpinnerを表示します。

- RxJSオペレーターとして使用し、Observableにパイプで接続
- 自動的にスピナーを表示/非表示し、最小表示時間を保証してちらつきを防止

実装例:

```typescript
// SpinnerFacadeを使用したAPI呼び出しの実装例
this.api
  .getArticle(articleId)
  .pipe(this.spinnerFacade.withSpinner())
  .subscribe((response) => {
    // 処理
  });
```

## スナックバー（Snackbar）

**キーワード**: `Snackbar`, `通知`, `SnackbarFacade`, `showSnackbar`, `成功メッセージ`

このセクションでは、API呼び出し後にSnackbarでメッセージを表示する方法について説明します。

**関連ファイル**:
- `apps/client/src/modules/snackbar/snackbar.facade.ts` - SnackbarFacade実装

### 主な利用例

- **API呼び出し後のメッセージ**: 保存成功、更新完了などの成功メッセージを表示

### 実装パターン

保存成功時は`SnackbarFacade.showSnackbar()`でメッセージを表示します。

実装例:

```typescript
// SnackbarFacadeを使用した成功メッセージ表示の実装例
this.facade
  .updateArticle(articleId, request)
  .subscribe(() => {
    this.snackbarFacade.showSnackbar('保存しました', 'success');
  });
```

## パフォーマンス最適化

**キーワード**: `Zoneless`, `変更検知`, `@rx-angular/template`, `RxLet`, `RxIf`, `ISR`

このセクションでは、Zoneless変更検知と@rx-angular/templateを使用したパフォーマンス最適化について説明します。

### Zoneless 変更検知

`provideZonelessChangeDetection()` により Zone.js を使用せず、効率的な変更検知を実現。

### @rx-angular/template

Observable をテンプレートで使用する際は `AsyncPipe` ではなく `@rx-angular/template` を使用します。

**なぜ rx-angular を使うか:**

- Zoneless 環境で必須（`AsyncPipe` は Zone.js に依存）
- 変更検知の効率化（最適なタイミングで `markForCheck()` を呼び出し）
- SSR との相性が良い

#### ディレクティブ・パイプの使い分け

| 機能        | 用途                                         | 例                                           |
| ----------- | -------------------------------------------- | -------------------------------------------- |
| `RxLet`     | Observable を変数として展開                  | `*rxLet="data$; let data"`                   |
| `RxIf`      | Observable の値で条件分岐 + suspense 対応    | `*rxIf="page$; let page; suspense: loading"` |
| `RxFor`     | Observable 配列のループ（将来用）            | `*rxFor="let item of items$; trackBy: 'id'"` |
| `RxPush`    | プロパティバインディングで Observable を使用 | `[data]="data$ \| push"`                     |
| `RxUnpatch` | イベントを Zone.js から除外                  | `<div [unpatch]="['click']" (click)="...">`  |

#### RxIf + RxPush の使用例

```typescript
import { RxIf } from '@rx-angular/template/if';
import { RxPush } from '@rx-angular/template/push';

@Component({
  imports: [RxIf, RxPush],
})
export class MyComponent {
  readonly page$ = this.facade.page$;
  readonly items$ = this.facade.items$;
}
```

```html
<!-- RxIf: 条件分岐 + suspense -->
<ng-container *rxIf="page$; let page; suspense: loading">
  <!-- RxPush: 子コンポーネントへのバインディング -->
  <app-content [page]="page" [items]="items$ | push" />
</ng-container>

<ng-template #loading>
  <p>読み込み中...</p>
</ng-template>
```

#### RxUnpatch の使用例

Change Detection が不要なイベント（オーバーレイのクリックなど）に使用します。

```html
<!-- unpatch: Zone.js を介さずにイベントを処理 -->
<div class="overlay" [unpatch]="['click']" (click)="closeSidebar()"></div>

<!-- 複数のイベントを unpatch -->
<div [unpatch]="['scroll', 'mousemove']" (scroll)="onScroll()">...</div>
```

```typescript
import { RxUnpatch } from '@rx-angular/template/unpatch';

@Component({
  imports: [RxUnpatch],
})
export class SidebarComponent { ... }
```

#### Signal vs Observable の使い分け

| データソース   | 推奨技術                | 理由                                            |
| -------------- | ----------------------- | ----------------------------------------------- |
| **Signal**     | 組み込み `@if` / `@for` | Signal はすでに効率的な Change Detection を持つ |
| **Observable** | RxIf / RxFor / RxPush   | Zone.js を介さず Observable をサブスクライブ    |

**Signal を rx-angular に置き換えない理由:**

1. **Signal はすでに効率的**: Angular Signal は Zone.js に依存しないリアクティブプリミティブ
2. **rx-angular は Observable 向け**: RxIf/RxFor/RxPush は非同期ストリーム（Observable）を効率的にテンプレートにバインドするために設計
3. **変換オーバーヘッドを避ける**: Signal を Observable に変換（`toObservable()`）するのは不要な複雑さ
4. **Angular 17+ の `@if`/`@for` は Signal と最適化**: 組み込みコントロールフローは Signal を意識して設計されている

```typescript
// 推奨: Signal には組み込み @if/@for を使用
@Component({ ... })
export class ArticleListContentComponent {
  readonly articles = input.required<Article[]>();
}
```

```html
<!-- Signal ベース: 組み込み @for で十分 -->
@for (article of articles(); track article.id) {
<app-article-card [article]="article" />
}
```

```typescript
// 推奨: Observable には rx-angular を使用
@Component({
  imports: [RxIf, RxPush],
})
export class ArticlePageComponent {
  readonly page$ = this.facade.page$;
  readonly items$ = this.facade.items$;
}
```

```html
<!-- Observable ベース: RxIf + RxPush -->
<ng-container *rxIf="page$; let page">
  <app-content [items]="items$ | push" />
</ng-container>
```

### ISR（Incremental Static Regeneration）

`@rx-angular/isr` により、静的ページを増分的に再生成。

```typescript
// ファイル: apps/client/src/app/app.routes.ts
// ISR設定の例
{ path: 'home', data: { revalidate: 60 } }  // 60秒ごとに再生成
```

## テスト戦略

**キーワード**: `テスト`, `Vitest`, `@testing-library/angular`, `カバレッジ`

このセクションでは、コンポーネントテストの実行方法と、Storybookとの役割分担について説明します。

コンポーネントテストは **Vitest + @testing-library/angular** で実行します。

```bash
pnpm test           # CI・開発共通
pnpm test:coverage  # カバレッジ付き
pnpm test:watch     # ウォッチモード
```

### 役割分担

| ツール    | 役割                           |
| --------- | ------------------------------ |
| Storybook | UIカタログ・ドキュメント       |
| Vitest    | コンポーネント・ユニットテスト |

> **Note**: `@storybook/addon-vitest` は Angular では未対応のため、テストは Vitest で行います。

## Storybook

**キーワード**: `Storybook`, `UIカタログ`, `ドキュメント`, `Stories`

このセクションでは、Storybookを使用したUIコンポーネントのカタログ・ドキュメント作成方法について説明します。

UIコンポーネントのカタログ・ドキュメントを提供します。

### 起動

```bash
pnpm storybook        # http://localhost:6006
```

### 対象コンポーネント

| カテゴリ   | パス                             | 内容                |
| ---------- | -------------------------------- | ------------------- |
| UI         | `shared/ui/button/`              | ButtonDirective     |
| UI         | `shared/ui/input/`               | InputDirective      |
| Components | `components/fields/input-field/` | InputFieldComponent |

### Stories の書き方

`*.stories.ts` ファイルに各バリアントを定義：

```typescript
// ファイル: apps/client/src/shared/ui/button/button.stories.ts
// Storybook Storiesの実装例
import { ButtonDirective } from './button';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<ButtonDirective> = {
  title: 'UI/Button',
  component: ButtonDirective,
  tags: ['autodocs'],
  // ...
};

export const Default: Story = {
  args: { variant: 'default' },
};
```
