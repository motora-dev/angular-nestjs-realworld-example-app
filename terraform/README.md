# Terraform (Deprecated)

> **Note**: Terraform configurations have been moved to the centralized repository.

## New Location

All Terraform configurations are now managed in the dedicated repository:

```
https://github.com/motora-dev/terraform
```

## Structure

The new repository manages infrastructure for multiple applications with a unified structure:

```
terraform/
├── apps/                          # Application-specific configurations
│   ├── angular-nestjs-realworld-example-app/
│   └── motora-dev/
├── packages/common/               # Shared Terraform modules
│   ├── iam/                       # Service accounts and IAM
│   ├── wif/                       # Workload Identity Federation
│   └── cloud-run/                 # Cloud Run services
├── environments/                  # Environment-specific settings
│   ├── develop.tfvars
│   ├── preview.tfvars
│   └── main.tfvars
├── main.tf
├── variables.tf
├── outputs.tf
└── versions.tf
```

## Secret Management

The infrastructure uses a 2-tier secret management system:

| Level           | Naming Rule        | Example                  | Purpose                                                                            |
| --------------- | ------------------ | ------------------------ | ---------------------------------------------------------------------------------- |
| **L1: Global**  | `{name}`           | `basic-auth-user`        | Shared across all services.<br>Common names even if values differ per environment. |
| **L2: Service** | `{service}-{name}` | `realworld-database-url` | Service-specific.<br>Prevents naming conflicts between services.                   |

Environment-specific prefixes (L3) have been removed as environments are separated by GCP projects.

## Environment Separation

**1 environment = 1 GCP project**. Each environment (develop, preview, main) is managed as an independent GCP project. The `project_id` in `environments/*.tfvars` files determines which project to use.

## Usage

```bash
# Clone the terraform repository
git clone https://github.com/motora-dev/terraform.git
cd terraform

# Initialize Terraform
terraform init

# Select workspace
terraform workspace select develop  # or preview, main

# Plan
terraform plan -var-file=environments/develop.tfvars

# Apply
terraform apply -var-file=environments/develop.tfvars
```

## Migration

This directory is kept for reference. The active Terraform code is in the centralized repository.
