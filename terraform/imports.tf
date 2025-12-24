# =============================================================================
# Import blocks for existing GCP resources
# These blocks are idempotent - once imported, they are ignored on subsequent runs
# =============================================================================

# Get project number for WIF imports
data "google_project" "import" {
  project_id = var.project_id
}

# =============================================================================
# Service Accounts
# =============================================================================

import {
  to = module.iam.google_service_account.github_actions
  id = "projects/${var.project_id}/serviceAccounts/github-actions-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

import {
  to = module.iam.google_service_account.cloud_run
  id = "projects/${var.project_id}/serviceAccounts/${var.service_name}-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

import {
  to = module.iam.google_service_account.vercel
  id = "projects/${var.project_id}/serviceAccounts/vercel-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

# =============================================================================
# Project IAM Members - GitHub Actions
# =============================================================================

import {
  to = module.iam.google_project_iam_member.github_actions_roles["roles/run.admin"]
  id = "${var.project_id} roles/run.admin serviceAccount:github-actions-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

import {
  to = module.iam.google_project_iam_member.github_actions_roles["roles/storage.admin"]
  id = "${var.project_id} roles/storage.admin serviceAccount:github-actions-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

import {
  to = module.iam.google_project_iam_member.github_actions_roles["roles/cloudbuild.builds.builder"]
  id = "${var.project_id} roles/cloudbuild.builds.builder serviceAccount:github-actions-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

import {
  to = module.iam.google_project_iam_member.github_actions_roles["roles/iam.serviceAccountUser"]
  id = "${var.project_id} roles/iam.serviceAccountUser serviceAccount:github-actions-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

import {
  to = module.iam.google_project_iam_member.github_actions_roles["roles/viewer"]
  id = "${var.project_id} roles/viewer serviceAccount:github-actions-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

# =============================================================================
# Project IAM Members - Cloud Run
# =============================================================================

import {
  to = module.iam.google_project_iam_member.cloud_run_roles["roles/cloudsql.client"]
  id = "${var.project_id} roles/cloudsql.client serviceAccount:${var.service_name}-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

import {
  to = module.iam.google_project_iam_member.cloud_run_roles["roles/secretmanager.secretAccessor"]
  id = "${var.project_id} roles/secretmanager.secretAccessor serviceAccount:${var.service_name}-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

# =============================================================================
# Service Account IAM Member - GitHub Actions can act as Cloud Run
# =============================================================================

import {
  to = module.iam.google_service_account_iam_member.github_actions_act_as_cloud_run
  id = "projects/${var.project_id}/serviceAccounts/${var.service_name}-${var.environment}@${var.project_id}.iam.gserviceaccount.com roles/iam.serviceAccountUser serviceAccount:github-actions-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

# =============================================================================
# Workload Identity Federation
# =============================================================================

import {
  to = module.wif.google_iam_workload_identity_pool.github
  id = "projects/${data.google_project.import.number}/locations/global/workloadIdentityPools/github-pool-${var.environment}"
}

import {
  to = module.wif.google_iam_workload_identity_pool_provider.github
  id = "projects/${data.google_project.import.number}/locations/global/workloadIdentityPools/github-pool-${var.environment}/providers/github-provider-${var.environment}"
}

# WIF IAM binding (GitHub Actions can use WIF)
import {
  to = module.wif.google_service_account_iam_member.github_wi
  id = "projects/${var.project_id}/serviceAccounts/github-actions-${var.environment}@${var.project_id}.iam.gserviceaccount.com roles/iam.workloadIdentityUser principalSet://iam.googleapis.com/projects/${data.google_project.import.number}/locations/global/workloadIdentityPools/github-pool-${var.environment}/attribute.repository/${var.github_org}/${var.github_repo}"
}

# =============================================================================
# Secrets (if they exist with the new naming convention)
# Uncomment as needed
# =============================================================================

# import {
#   to = module.secrets.google_secret_manager_secret.secrets["database-url"]
#   id = "projects/${var.project_id}/secrets/${var.service_name}-database-url"
# }

# import {
#   to = module.secrets.google_secret_manager_secret.secrets["cors-origins"]
#   id = "projects/${var.project_id}/secrets/${var.service_name}-cors-origins"
# }

# import {
#   to = module.secrets.google_secret_manager_secret.secrets["cookie-domain"]
#   id = "projects/${var.project_id}/secrets/${var.service_name}-cookie-domain"
# }

# import {
#   to = module.secrets.google_secret_manager_secret.secrets["basic-auth-user"]
#   id = "projects/${var.project_id}/secrets/${var.service_name}-basic-auth-user"
# }

# import {
#   to = module.secrets.google_secret_manager_secret.secrets["basic-auth-password"]
#   id = "projects/${var.project_id}/secrets/${var.service_name}-basic-auth-password"
# }

# import {
#   to = module.secrets.google_secret_manager_secret.secrets["isr-secret"]
#   id = "projects/${var.project_id}/secrets/${var.service_name}-isr-secret"
# }

# import {
#   to = module.secrets.google_secret_manager_secret.secrets["session-secret-token"]
#   id = "projects/${var.project_id}/secrets/${var.service_name}-session-secret-token"
# }

# =============================================================================
# Note: Service Account Keys CANNOT be imported (they contain private keys)
# Terraform will create new keys on apply. Delete old keys manually if needed.
# =============================================================================

