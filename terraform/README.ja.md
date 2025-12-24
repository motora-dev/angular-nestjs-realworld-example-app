# Terraform Infrastructure as Code

> ⚠️ **注意**: このディレクトリのTerraform設定は非推奨です。
>
> 現在、インフラ管理は **[motora-dev/terraform](https://github.com/motora-dev/terraform)** リポジトリに統合されています。

## 🔄 移行について

2024年12月より、以下のプロジェクトのインフラ管理が統合されました：

- `angular-nestjs-realworld-example-app` (realworld)
- `motora-dev`

### 移行先リポジトリ

```
https://github.com/motora-dev/terraform
```

### 新しい構成

```
terraform/
├── apps/                          # アプリケーション固有の設定
│   ├── angular-nestjs-realworld-example-app/
│   └── motora-dev/
├── packages/common/               # 共通モジュール
│   ├── iam/                       # サービスアカウントとIAM設定
│   ├── wif/                       # Workload Identity Federation
│   ├── cloud-run/                 # Cloud Runサービス
│   └── secrets/                   # Secret Manager
├── environments/                  # 環境別設定
│   ├── develop.tfvars
│   ├── preview.tfvars
│   └── main.tfvars
├── main.tf
├── variables.tf
├── outputs.tf
└── versions.tf
```

## 🚀 使用方法

### 1. terraform リポジトリをクローン

```bash
git clone https://github.com/motora-dev/terraform.git
cd terraform
```

### 2. Workspace を選択して実行

```bash
# Terraformの初期化
terraform init

# Workspaceを選択
terraform workspace select develop  # or preview, main

# 実行計画の確認
terraform plan -var-file=environments/develop.tfvars

# インフラの構築
terraform apply -var-file=environments/develop.tfvars
```

## 📝 シークレットの3段階管理

新しい構成では、シークレットを3段階で管理しています：

| レベル               | 命名規則                 | 例                               | 用途                     |
| -------------------- | ------------------------ | -------------------------------- | ------------------------ |
| **L1: グローバル**   | `{name}`                 | `basic-auth-user`                | 全環境・全サービス共通   |
| **L2: サービス共通** | `{service}-{name}`       | `realworld-database-url`         | 全環境共通・サービス個別 |
| **L3: 環境個別**     | `{env}-{service}-{name}` | `develop-realworld-cors-origins` | 環境・サービス個別       |

## 🔒 このディレクトリについて

このディレクトリは歴史的な参照のために残されていますが、**新しい変更は terraform リポジトリで行ってください**。

- ✅ 新しいインフラ変更 → `motora-dev/terraform`
- ❌ このディレクトリでの変更 → 非推奨

## 📚 参考リンク

- [terraform リポジトリ](https://github.com/motora-dev/terraform)
- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
