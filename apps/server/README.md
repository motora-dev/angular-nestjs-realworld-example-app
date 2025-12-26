# Server Application

Backend API built with NestJS + esbuild + swc + Vitest + Prisma + CQRS.

**Framework & Build:**</br>
[![NestJS](https://img.shields.io/badge/NestJS-11.1.10-E0234E.svg?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![esbuild](https://img.shields.io/badge/esbuild-0.27.2-FFCF00.svg?logo=esbuild)](https://esbuild.github.io/)
[![SWC](https://img.shields.io/badge/SWC-1.15.7-F8C457.svg)](https://swc.rs/)

**Lint & Format:**</br>
[![ESLint](https://img.shields.io/badge/ESLint-9.39.2-4B32C3.svg?logo=eslint)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3.7.4-F7B93E.svg?logo=prettier)](https://prettier.io/)

**Database:**</br>
[![Prisma](https://img.shields.io/badge/Prisma-7.2.0-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?logo=postgresql)](https://www.postgresql.org/)

**Testing:**</br>
[![Vitest](https://img.shields.io/badge/Vitest-4.0.16-6E9F18.svg?logo=vitest)](https://vitest.dev/)
[![jsdom](https://img.shields.io/badge/jsdom-27.4.0-F7DF1E.svg)](https://github.com/jsdom/jsdom)

## Table of Contents

**Getting Started**

- [Development Commands](#development-commands)
- [Environment Variables](#environment-variables)

**Architecture**

- [Design Philosophy](#design-philosophy)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Placement Guidelines](#placement-guidelines)

**Patterns**

- [CQRS (@nestjs/cqrs)](#cqrs-nestjscqrs)
- [Database Access (Prisma)](#database-access-prisma)
- [Error Handling](#error-handling)
- [CSRF Protection](#csrf-protection)
- [Authentication Flow (OAuth)](#authentication-flow-oauth)
- [API Documentation (OpenAPI)](#api-documentation-openapi)

**Development**

- [Testing Strategy](#testing-strategy)
- [Build System (esbuild + SWC)](#build-system-esbuild--swc)
- [Developer Experience Improvements](#developer-experience-improvements)
- [Package Management (pnpm catalog)](#package-management-pnpm-catalog)
- [Configuration Files](#configuration-files)

---

## Development Commands

**Keywords**: `pnpm`, `dev server`, `build`, `test`, `lint`, `format`

This section explains the main development commands used in the project.

```bash
# Complete cleanup (including node_modules)
pnpm clean

# Clear cache (.tsbuildinfo, .turbo, coverage, dist)
pnpm clean:cache

# Start dev server (watch + debug)
pnpm start

# Build
pnpm build

# Start production server
pnpm start:prd

# Test
pnpm test

# Unit tests only
pnpm test:unit

# E2E tests only
pnpm test:e2e

# Tests with coverage
pnpm test:coverage

# Lint
pnpm lint

# Lint + auto-fix
pnpm lint:fix

# Format check
pnpm format

# Format + auto-fix
pnpm format:fix

# Type check
pnpm tsc

# Run all checks (lint + format + tsc + test)
pnpm check-all
```

## Environment Variables

**Keywords**: `environment variables`, `.env`, `database`, `CORS`

This section explains the required environment variables and how to configure them.

| Variable                 | Description                                  | Example                                   | Required |
| ------------------------ | -------------------------------------------- | ----------------------------------------- | -------- |
| **Database**             |                                              |                                           |          |
| `DATABASE_URL`           | PostgreSQL database URL (connection pool)    | `postgresql://postgres:pass@host/db`      | Yes      |
| **Server**               |                                              |                                           |          |
| `NODE_ENV`               | Runtime environment                          | `development` / `production`              | No       |
| `PORT`                   | Server port number                           | `4000`                                    | No       |
| **Client / CORS / CSRF** |                                              |                                           |          |
| `CLIENT_URL`             | Client application URL                       | `http://localhost:4200`                   | Yes      |
| `CORS_ORIGINS`           | CORS allowed origins (comma-separated)       | `http://localhost:4200`                   | Yes      |
| `CSRF_SECRET`            | CSRF protection secret key                   | `your-csrf-secret-key`                    | Yes      |
| **Google OAuth**         |                                              |                                           |          |
| `GOOGLE_CLIENT_ID`       | Google OAuth Client ID                       | `xxx.apps.googleusercontent.com`          | Yes      |
| `GOOGLE_CLIENT_SECRET`   | Google OAuth Secret                          | `GOCSPX-xxx`                              | Yes      |
| `GOOGLE_CALLBACK_URL`    | Google OAuth Callback URL                    | `http://localhost:4000/api/auth/callback` | Yes      |
| **JWT**                  |                                              |                                           |          |
| `JWT_PRIVATE_KEY`        | JWT signing RSA private key (PEM format)     | `-----BEGIN RSA PRIVATE KEY-----\n...`    | Yes      |
| `JWT_PUBLIC_KEY`         | JWT verification RSA public key (PEM format) | `-----BEGIN PUBLIC KEY-----\n...`         | Yes      |

### Setting Up Environment Variables

```bash
# Copy .env.example
cp .env.example .env

# Edit .env in your editor and set actual values
```

### Generating RSA Key Pair

Generate an RSA key pair for JWT signing:

```bash
# Generate private key (2048 bits)
openssl genrsa -out private.pem 2048

# Extract public key
openssl rsa -in private.pem -pubout -out public.pem
```

When setting the generated keys as environment variables, replace newlines with `\n`:

```bash
# Convert private key to single line (for .env)
node -e "console.log('JWT_PRIVATE_KEY=' + JSON.stringify(require('fs').readFileSync('private.pem', 'utf8').trim()))"

# Convert public key to single line (for .env)
node -e "console.log('JWT_PUBLIC_KEY=' + JSON.stringify(require('fs').readFileSync('public.pem', 'utf8').trim()))"
```

**When using GCP Secret Manager**, newlines can be preserved as-is without escaping.

**Note**: Never commit private keys to Git. For production environments, use secret management services like GCP Secret Manager.

---

## Design Philosophy

**Keywords**: `design principles`, `Vertical Slice Architecture`, `Layered Architecture`, `CQRS`, `Repository pattern`

This section explains the project's design philosophy and why this structure was chosen.

### Why This Structure?

1. **Alphabetical Consistency**: Visually organized in order: `domains → modules → shared`
2. **Vertical Slice Architecture**: Each domain is self-contained as an independent slice with high cohesion
3. **CQRS**: Separates reads (Query) and writes (Command) with clear responsibilities
4. **DDD Boundary Awareness**: Domain-specific items stay within domains; only shared items move to upper layers
5. **Repository Pattern**: Abstracts data access, reducing coupling with business logic

### Why Layered Architecture Instead of Clean Architecture?

This project adopts **Vertical Slice + Layered Architecture** rather than strict **Clean Architecture**.

#### Differences from Clean Architecture

| Aspect                               | Clean Architecture             | This Project (Layered)    |
| ------------------------------------ | ------------------------------ | ------------------------- |
| Dependency Direction                 | Outside→Inside (circular, DIP) | Top→Down (unidirectional) |
| Repository                           | Interface + Implementation     | Concrete classes only     |
| Dependency Inversion Principle (DIP) | Required                       | Not adopted               |
| Cognitive Load                       | High (exponential growth)      | Low (linear/constant)     |

#### Reasons for Not Adopting DIP

1. **Slice Independence Through Vertical Slices**
   - Each domain is completely independent; changes are contained within slices
   - No need to know internal implementation of other slices

2. **Sufficient Testability with NestJS DI**
   - Can replace mocks via `providers` during testing
   - Ensures testability without interfaces

3. **Accepting Prisma Lock-in**
   - Scenarios for changing DB are rare
   - Excessive abstraction only adds complexity

4. **Dependency Direction Constraint is Sufficient**
   - `Controller → Handler → Service → Repository → Prisma`
   - Only allow dependencies in this direction; reverse is prohibited

#### Cognitive Load Perspective

- **Clean Architecture**: Interface + Implementation pairs increase with each feature → Difficult to grasp relationships (exponential growth)
- **Vertical Slice + Layered**: Only independent slices increase → Each slice follows the same pattern (linear growth or constant)

### Differences from NestJS Official Style Guide

This structure differs somewhat from the NestJS official style guide's recommendations (module configuration per feature). This is an intentional choice prioritizing design principles (Vertical Slice / Layered Architecture / CQRS).

Team members should refer to this README and understand the placement guidelines before development.

## Architecture

**Keywords**: `Vertical Slice Architecture`, `Layered Architecture`, `layer structure`, `dependencies`

This section explains the overall architecture design. We adopt a combination of Vertical Slice Architecture and Layered Architecture.

### Layer Structure

| Directory  | Layer                 | Responsibility                         | Status |
| ---------- | --------------------- | -------------------------------------- | ------ |
| `domains/` | Presentation + Domain | Endpoints, business logic, data access | In use |
| `modules/` | Application           | Modules shared across domains          | In use |
| `shared/`  | Infrastructure        | Adapters, utilities, common processing | In use |

### Dependency Rules

```
domains/ ──→ modules/ ──→ shared/
```

- Upper layers can depend on lower layers (rightward dependencies only)
- Lower layers must not depend on upper layers (leftward dependencies prohibited)
- `shared/` can be referenced from all layers

## Directory Structure

**Keywords**: `Vertical Slice`, `directory structure`, `domains/`, `modules/`, `shared/`

This section explains the project's directory structure and each directory's role.

```
src/
├── domains/          # (d) Each domain (Vertical Slice)
│   └── {domain}/
│       ├── {domain}.controller.ts  # Endpoint definition
│       ├── {domain}.module.ts      # Module definition
│       ├── commands/               # Write operations (CQRS)
│       │   └── {action}/
│       │       ├── {action}.command.ts
│       │       └── {action}.handler.ts
│       ├── queries/                # Read operations (CQRS)
│       │   └── {action}/
│       │       ├── {action}.query.ts
│       │       └── {action}.handler.ts
│       ├── contracts/              # Request/Response types
│       │   ├── {domain}.dto.ts     # DTO definition
│       │   ├── {domain}.input.ts   # Input type definition
│       │   └── {domain}.model.ts   # Model definition
│       ├── presenters/             # Response formatting
│       ├── repositories/           # Data access
│       └── services/               # Business logic
│   └── sitemap/            # Sitemap domain
│       ├── sitemap.controller.ts
│       └── ...
├── modules/          # (m) Modules shared across domains
│   └── auth/             # Authentication module
├── shared/           # (s) Shared resources
│   ├── adapters/         # External service adapters (Prisma)
│   ├── decorators/       # Custom decorators
│   ├── errors/           # Error classes
│   ├── filters/          # Exception filters
│   ├── guards/           # Auth guards
│   ├── interceptors/     # Interceptors
│   └── utils/            # Utilities
├── types/            # Type definitions
├── app.module.ts     # Root module
└── main.ts           # Entry point
```

### Standard Domain Component Pattern

Each domain follows the standard pattern: **Controller + Query/Command + Service + Repository**.

```
domains/{domain}/
├── {domain}.controller.ts      # HTTP endpoints
├── {domain}.module.ts          # Module definition
├── commands/                   # Write operations (POST, PUT, DELETE)
│   ├── index.ts
│   └── {action}/
│       ├── {action}.command.ts
│       └── {action}.handler.ts
├── queries/                    # Read operations (GET)
│   ├── index.ts
│   └── {action}/
│       ├── {action}.query.ts
│       └── {action}.handler.ts
├── contracts/                  # Request/Response types
│   ├── index.ts
│   ├── {domain}.dto.ts
│   ├── {domain}.input.ts
│   └── {domain}.model.ts
├── presenters/                 # Response formatting
│   └── index.ts
├── repositories/               # Data access
│   └── index.ts
└── services/                   # Business logic
    └── index.ts
```

## Placement Guidelines

**Keywords**: `file placement`, `placement rules`, `path aliases`, `naming conventions`

This section explains guidelines for where to place files and components. Also refer to the [Directory Structure](#directory-structure) section.

### What Goes Where

| Item                        | Location                         | Example                                 |
| --------------------------- | -------------------------------- | --------------------------------------- |
| HTTP endpoints              | `domains/{domain}/`              | `domains/article/article.controller.ts` |
| Read logic (GET)            | `domains/{domain}/queries/`      | `queries/get-article/`                  |
| Write logic (POST, etc.)    | `domains/{domain}/commands/`     | `commands/create-article/`              |
| Request/Response types      | `domains/{domain}/contracts/`    | `contracts/article.dto.ts`              |
| Response formatting         | `domains/{domain}/presenters/`   | `presenters/article.presenter.ts`       |
| Data access                 | `domains/{domain}/repositories/` | `repositories/article.repository.ts`    |
| Business logic              | `domains/{domain}/services/`     | `services/article.service.ts`           |
| Multi-domain shared modules | `modules/`                       | `modules/auth/`                         |
| External service adapters   | `shared/adapters/`               | `adapters/prisma/prisma.adapter.ts`     |
| Custom decorators           | `shared/decorators/`             | `decorators/current-user.decorator.ts`  |
| Error classes               | `shared/errors/`                 | `errors/app-error.ts`                   |
| Exception filters           | `shared/filters/`                | `filters/http-exception.filter.ts`      |
| Auth guards                 | `shared/guards/`                 | `guards/auth.guard.ts`                  |
| Interceptors                | `shared/interceptors/`           | `interceptors/logging.interceptor.ts`   |
| Utility functions           | `shared/utils/`                  | `utils/id-generator.ts`                 |

### Path Aliases

```typescript
import { PrismaAdapter } from '$adapters';
import { CurrentUser } from '$decorators';
import { AppError, NotFoundError } from '$errors';
import { HttpExceptionFilter } from '$filters';
import { AuthService } from '$modules/auth';
```

| Alias           | Path                      |
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

### Naming Conventions

- Controller: `{domain}.controller.ts`
- Module: `{domain}.module.ts`
- Service: `{domain}.service.ts`
- Repository: `{domain}.repository.ts`
- DTO: `{domain}.dto.ts`
- Input: `{domain}.input.ts`
- Model: `{domain}.model.ts`
- Presenter: `{domain}.presenter.ts`
- Query: `{action}.query.ts`
- Command: `{action}.command.ts`
- Handler: `{action}.handler.ts`
- Test: `{name}.test.ts`

---

## CQRS (@nestjs/cqrs)

**Keywords**: `CQRS`, `Command`, `Query`, `Handler`, `@nestjs/cqrs`, `Layered Architecture`

This section explains responsibility separation between reads and writes using the CQRS pattern.

**Related Files**:

- `apps/server/src/domains/{domain}/queries/{action}/{action}.query.ts` - Query definition
- `apps/server/src/domains/{domain}/queries/{action}/{action}.handler.ts` - QueryHandler implementation
- `apps/server/src/domains/{domain}/commands/{action}/{action}.command.ts` - Command definition
- `apps/server/src/domains/{domain}/commands/{action}/{action}.handler.ts` - CommandHandler implementation

### Layer Structure Within Domains

Within each domain (Vertical Slice), we adopt Layered Architecture.

| Directory          | Layer        | Responsibility                   |
| ------------------ | ------------ | -------------------------------- |
| `controller`       | Presentation | HTTP request/response processing |
| `presenters`       | Presentation | Response data formatting         |
| `queries/commands` | Application  | Use case orchestration (CQRS)    |
| `services`         | Application  | Business logic                   |
| `repositories`     | Data Access  | Database access (Prisma)         |
| `contracts`        | Shared       | DTO/Input/Model definitions      |

#### Data Flow

```
Controller → QueryHandler/CommandHandler → Service → Repository → PrismaAdapter
```

### Design Principles

The CQRS (Command Query Responsibility Segregation) pattern separates read and write responsibilities.

#### Query (Read)

Only retrieves data without modifying state.

```typescript
// Recommended: Queries don't modify state
// queries/get-article-list/get-article-list.query.ts
export class GetArticleListQuery {
  public constructor() {}
}
```

```typescript
// Recommended: QueryHandler only retrieves data
// queries/get-article-list/get-article-list.handler.ts
@QueryHandler(GetArticleListQuery)
export class GetArticleListHandler implements IQueryHandler<GetArticleListQuery> {
  constructor(private readonly articleListService: ArticleListService) {}

  async execute(): Promise<ArticleListDto> {
    return await this.articleListService.getArticleList();
  }
}
```

#### Command (Write)

Performs operations that modify state.

```typescript
// Recommended: Commands represent state-modifying operations
// commands/create-article/create-article.command.ts
export class CreateArticleCommand {
  constructor(
    public readonly title: string,
    public readonly content: string,
  ) {}
}
```

```typescript
// Recommended: CommandHandler executes state-modifying operations
// commands/create-article/create-article.handler.ts
@CommandHandler(CreateArticleCommand)
export class CreateArticleHandler implements ICommandHandler<CreateArticleCommand> {
  constructor(private readonly articleService: ArticleService) {}

  async execute(command: CreateArticleCommand): Promise<void> {
    await this.articleService.createArticle(command.title, command.content);
  }
}
```

### Controller Usage

```typescript
// Recommended: Use QueryBus/CommandBus in Controllers to implement CQRS pattern
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

### Benefits

- **Responsibility Separation**: Read and write logic are clearly separated
- **Scalability**: Reads and writes can be scaled independently
- **Testability**: Each Handler is independent, making testing easy

## Database Access (Prisma)

**Keywords**: `Prisma`, `database`, `Repository pattern`, `PrismaAdapter`, `ESModule`

This section explains database access implementation patterns using Prisma.

**Related Files**:

- `apps/server/src/shared/adapters/prisma/prisma.adapter.ts` - PrismaAdapter implementation
- `apps/server/src/domains/{domain}/repositories/{domain}.repository.ts` - Repository implementation

### Prisma ESModule Support

#### Background

From Prisma 7.x onward, `@prisma/client` is provided as an ESModule. This change aligns with Node.js's ESModule migration.

#### Notes for `type: "module"` Environment

This project specifies `"type": "module"`, treating all files as ESModules. This required the following adaptations:

1. **esbuild usage is mandatory** - `tsc` (TypeScript compiler) or SWC cannot resolve paths or bundle in ESModule environments
2. **`format: 'esm'` specification** - Set esbuild output format to ESModule
3. **`reflect-metadata` import** - Add import statement at the beginning via banner

```javascript
// Recommended: In ESModule environment, set format: 'esm' and reflect-metadata banner
// From esbuild.config.mjs
const config = {
  format: 'esm',
  banner: {
    js: "import 'reflect-metadata';",
  },
};
```

#### Prisma Client Placement

The Prisma client is managed in the `@monorepo/database` package and shared across the monorepo:

```
packages/database/
├── prisma/
│   └── schema.prisma       # Schema definition
└── src/
    └── generated/
        └── prisma-client/  # Generated client
```

### PrismaAdapter

An adapter that integrates Prisma Client with NestJS's lifecycle.

```typescript
// Recommended: Use PrismaAdapter to integrate Prisma Client with NestJS lifecycle
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

### Repository Pattern

Define Repository in each domain to abstract data access.

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

### Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Sync database schema
pnpm prisma db push

# Seed data
pnpm prisma db seed
```

## Error Handling

**Keywords**: `error handling`, `AppError`, `HttpExceptionFilter`, `exception handling`, `error response`

This section explains how to handle API errors and business logic errors.

**Related Files**:

- `apps/server/src/shared/errors/app-error.ts` - AppError implementation
- `apps/server/src/shared/filters/http-exception.filter.ts` - HttpExceptionFilter implementation

### AppError

Custom exception class representing errors in the business logic layer. Use derived classes corresponding to HTTP status codes.

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

Catches all exceptions and converts them to a unified response format.
For validation errors (422), returns GitHub-style detailed error information; otherwise returns standard error response.

Additionally, in production environment (`NODE_ENV=production`), hides details of 5xx errors (`errorCode` and `params`) for security.

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

### Error Response Format

**Standard Error:**

```json
{
  "errorCode": "NOT_FOUND",
  "message": "Article not found",
  "params": { "id": "123" }
}
```

**Validation Error (422):**

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

## CSRF Protection

**Keywords**: `CSRF`, `Double Submit Cookie`, `csrf-csrf`, `security`

This section explains the implementation to protect the API from CSRF (Cross-Site Request Forgery) attacks.

**Related Files**:

- `apps/server/src/main.ts` - CSRF configuration

### Double Submit Cookie Pattern

This project uses the **Double Submit Cookie** pattern with the `csrf-csrf` library.

```typescript
// main.ts
import { doubleCsrf } from 'csrf-csrf';

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => csrfSecret,
  getSessionIdentifier: (req) => req.cookies?.['csrf-session-id'] || '',
  cookieName: 'XSRF-TOKEN',
  cookieOptions: {
    httpOnly: false, // Readable from JavaScript
    sameSite: 'lax',
    secure: isProd,
    path: '/',
  },
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req) => req.headers['x-xsrf-token'],
});
```

### Session Identification (without express-session)

Uses the `csrf-session-id` cookie to identify sessions. This enables CSRF protection without `express-session`.

```typescript
// Auto-generate csrf-session-id if not present
app.use((req, res, next) => {
  if (!req.cookies?.['csrf-session-id']) {
    const csrfSessionId = randomUUID();
    res.cookie('csrf-session-id', csrfSessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });
  }
  next();
});
```

### Client-side Implementation

The client reads the value of the `XSRF-TOKEN` cookie and sets it in the `x-xsrf-token` header when sending requests.

## Authentication Flow (OAuth)

**Keywords**: `OAuth`, `Google authentication`, `JWT`, `Access Token`, `Refresh Token`

This section explains the authentication flow using Google OAuth and session management with JWT.

**Related Files**:

- `apps/server/src/modules/auth/auth.controller.ts` - Authentication endpoints
- `apps/server/src/modules/auth/services/auth.service.ts` - Authentication logic

### Authentication Flow Overview

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Google

    Client->>Server: GET /api/auth/login/google
    Server->>Google: Redirect (OAuth consent screen)
    Google->>Server: Callback (authorization code)
    alt User exists
        Server->>Client: Set access-token, refresh-token
        Client->>Client: Redirect to home
    else New user
        Server->>Client: Set pending-registration
        Client->>Client: Redirect to registration page
        Client->>Server: POST /api/auth/register
        Server->>Client: Set access-token, refresh-token
    end
```

### Pending Registration Pattern

For new users, instead of creating an account immediately after OAuth authentication, issue a temporary `pending-registration` token.

**Benefits:**

- Users can choose their own username
- Can display email address obtained from OAuth provider on confirmation screen
- Prevents incorrect account creation

### Token Configuration

| Token           | Lifespan    | Purpose                                     | Cookie Path |
| --------------- | ----------- | ------------------------------------------- | ----------- |
| `access-token`  | Short-lived | API authentication (sent with each request) | `/`         |
| `refresh-token` | Long-lived  | Refresh Access Token                        | `/api/auth` |

### check-session Endpoint

Endpoint for clients to verify authentication status. Designed to **not return 401** to avoid console errors.

```typescript
// GET /api/auth/check-session
// Always returns 200 OK, notifies status with authenticated: true/false
async checkSession(): Promise<{ authenticated: boolean; user?: User }> {
  // 1. access-token is valid → authenticated: true
  // 2. Can refresh with refresh-token → authenticated: true
  // 3. Both invalid → authenticated: false
}
```

## API Documentation (OpenAPI)

**Keywords**: `OpenAPI`, `Swagger`, `Redoc`, `API documentation`

This section explains API documentation provision using OpenAPI specification.

**Related Files**:

- `apps/server/src/main.ts` - OpenAPI configuration

### Redoc UI

API documentation is provided in both development and production environments.

| Endpoint         | Content                              |
| ---------------- | ------------------------------------ |
| `/api/docs`      | Redoc UI (interactive documentation) |
| `/api/docs.json` | OpenAPI JSON specification           |

### Configuration Example

```typescript
// main.ts
const swaggerConfig = new DocumentBuilder()
  .setTitle('RealWorld API')
  .setDescription('Conduit API specification - RealWorld example app')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, swaggerConfig);

// Serve Redoc UI
app.use('/api/docs', (_req, res) => {
  res.send(`
    <redoc spec-url='/api/docs.json'></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  `);
});
```

---

## Testing Strategy

**Keywords**: `testing`, `Vitest`, `unit test`, `E2E test`, `coverage`, `SWC`

This section explains testing execution methods and testing strategy using Vitest.

Advantages compared to Jest:

1. **Fast startup** - Native ESModule support for fast startup
2. **SWC transpilation** - Fast test file transformation
3. **Vite ecosystem integration** - Configuration can be shared

### Test Configuration

Use Vitest with separate management of unit tests and e2e tests.

```bash
pnpm test           # Run all tests
pnpm test:unit      # Unit tests only
pnpm test:e2e       # E2E tests only
pnpm test:coverage  # With coverage
```

### Test Types

Tests are separated into two types:

| Test Type  | File Pattern | Description               |
| ---------- | ------------ | ------------------------- |
| Unit tests | `*.test.ts`  | Individual function tests |
| E2E tests  | `*.spec.ts`  | End-to-end tests          |

### Fast Transpilation with SWC

Vitest also uses SWC to transform decorators:

```typescript
// Excerpt from vitest.config.ts
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

### V8 Coverage

Uses V8 engine's native coverage functionality for fast coverage report generation:

```bash
# Run tests with coverage
pnpm test:coverage
```

### Test File Placement

Placement varies by test type:

| Test Type  | Location                               | Reason                     |
| ---------- | -------------------------------------- | -------------------------- |
| Unit tests | Under `src/`, same directory as target | Proximity to target code   |
| E2E tests  | Under `test/` directory                | Targets entire application |

**Unit Test Example:**

```
src/domains/article-list/
├── article-list.controller.ts
├── article-list.controller.test.ts    # Same directory as target
├── article-list.module.ts
├── article-list.module.test.ts
└── queries/
    └── get-article-list/
        ├── get-article-list.query.ts
        └── get-article-list.query.test.ts
```

**E2E Test Example:**

```
test/
└── shared/
    ├── filters/
    │   └── http-exception.filter.spec.ts
    └── interceptors/
        └── logging.interceptor.spec.ts
```

### Naming Conventions

- Unit tests: `{name}.test.ts`
- E2E tests: `{name}.spec.ts`

### Testing Best Practices

**Write expected values in expect as literals (hard-coded)**

For test readability and clear intent, use literal values rather than variables in `expect` statements.

```typescript
// Good - Expected value is immediately clear
expect(error.name).toBe('BadRequestError');
expect(result.count).toBe(5);

// Bad - Need to track variable definition
const expectedName = 'BadRequestError';
expect(error.name).toBe(expectedName);
```

**Reasons:**

- Can understand expected results just by reading test code
- No need to search for variable definitions
- Easier debugging when tests fail

## Build System (esbuild + SWC)

**Keywords**: `esbuild`, `SWC`, `build`, `decorators`, `ESModule`, `hot reload`

This section explains the build system using esbuild and SWC.

### Why esbuild?

Traditional NestJS projects used `tsc` (TypeScript compiler), which had several issues:

1. **Slow build times** - Builds could take tens of seconds as projects grew
2. **Path resolution issues in ESModule environment** - Path aliases like `$domains/*` couldn't be resolved
3. **Prisma client issues** - Couldn't properly handle ESModule format clients from Prisma 7.x onward

Using esbuild solves all these problems.

### Decorator Support via SWC Plugin

NestJS heavily uses TypeScript decorators, but esbuild alone doesn't support decorator metadata (`emitDecoratorMetadata`).

Therefore, we use SWC as an esbuild plugin to properly transform decorators:

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

### Hot Reload Development Server

When building with the `--watch` flag, file changes are automatically detected, triggering rebuild & server restart:

```bash
# Start dev server (hot reload + debugger)
pnpm start
```

### Debugger Support

Using the `--debug` flag starts the Node.js inspector on port 9230. You can attach from IDEs like VS Code for debugging.

## Developer Experience Improvements

**Keywords**: `developer experience`, `build speed`, `test speed`, `hot reload`, `debug`

This section explains developer experience improvements through esbuild and Vitest.

### Dramatic Speed Improvements

| Item         | Before (tsc + Jest) | Now (esbuild + Vitest) | Improvement |
| ------------ | ------------------- | ---------------------- | ----------- |
| Build        | 20-30 seconds       | **200-500 ms**         | ~50-100x    |
| Test startup | 5-10 seconds        | **500 ms - 1 second**  | ~10-20x     |
| Hot reload   | Not supported       | **Supported**          | -           |

These speed improvements dramatically shorten the feedback loop during development, significantly enhancing the developer experience.

## Package Management (pnpm catalog)

**Keywords**: `pnpm`, `catalog`, `version management`, `pnpm-workspace.yaml`

This section explains centralized package version management using pnpm catalog.

Versions are managed centrally in `pnpm-workspace.yaml` and unified across the monorepo.

### Configuration Example

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

### Version Update Procedure

1. Change versions in `pnpm-workspace.yaml`
2. Run `pnpm install` to update all packages at once

## Configuration Files

**Keywords**: `configuration files`, `TypeScript`, `ESLint`, `Vitest`, `esbuild`, `NestJS`

This section explains various configuration files used in the project.

| File                  | Purpose                       |
| --------------------- | ----------------------------- |
| `tsconfig.json`       | Development TypeScript config |
| `tsconfig.build.json` | Build TypeScript config       |
| `tsconfig.spec.json`  | Test TypeScript config        |
| `tsconfig.debug.json` | Debug TypeScript config       |

### Lint & Test Configuration

| File                | Purpose       |
| ------------------- | ------------- |
| `eslint.config.mjs` | ESLint config |
| `vitest.config.ts`  | Vitest config |

### NestJS & Framework Configuration

| File                 | Purpose              |
| -------------------- | -------------------- |
| `nest-cli.json`      | NestJS CLI config    |
| `esbuild.config.mjs` | esbuild build config |
| `turbo.json`         | Turborepo config     |
