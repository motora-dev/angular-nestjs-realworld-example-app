# Terraform (Deprecated)

> **Note**: Terraform configurations have been moved to the centralized repository.

## New Location

All Terraform configurations are now managed in the dedicated repository:

```
https://github.com/motora-dev/terraform
```

## Structure

The new repository manages infrastructure for multiple applications:

```
terraform/
├── apps/
│   ├── realworld/     # This application (angular-nestjs-realworld-example-app)
│   └── motora/        # motora-dev
└── packages/
    └── common/        # Shared Terraform modules
```

## Usage

```bash
cd path/to/terraform
pnpm install
pnpm --filter @terraform/realworld plan:dev
```

## Migration

This directory is kept for reference. The active Terraform code is in the centralized repository.
