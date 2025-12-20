# Workload Identity Pool
resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github-pool-${var.environment}"
  display_name              = "GitHub Pool (${var.environment})"
  description               = "Workload Identity Pool for GitHub Actions"
  project                   = var.project_id
}

# Workload Identity Provider
resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider-${var.environment}"
  display_name                       = "GitHub Provider (${var.environment})"
  description                        = "Workload Identity Provider for GitHub Actions"
  project                            = var.project_id

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
    "attribute.environment" = "assertion.environment"
  }

  attribute_condition = "assertion.repository == '${var.github_org}/${var.github_repo}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# Allow GitHub Actions to impersonate the service account
resource "google_service_account_iam_member" "github_wi" {
  service_account_id = "projects/${var.project_id}/serviceAccounts/${var.github_service_account_id}"
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.current.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.github.workload_identity_pool_id}/attribute.repository/${var.github_org}/${var.github_repo}"
}

# Get project number
data "google_project" "current" {
  project_id = var.project_id
}
