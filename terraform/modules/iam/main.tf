# Service Account for GitHub Actions
resource "google_service_account" "github_actions" {
  account_id   = "github-actions-${var.environment}"
  display_name = "GitHub Actions Service Account (${var.environment})"
  description  = "Service account for GitHub Actions to deploy to Cloud Run"
  project      = var.project_id
}

# Service Account for Cloud Run
resource "google_service_account" "cloud_run" {
  account_id   = "${var.service_name}-${var.environment}"
  display_name = "Cloud Run Service Account (${var.environment})"
  description  = "Service account for Cloud Run service"
  project      = var.project_id
}

# IAM roles for GitHub Actions service account
locals {
  github_actions_roles = [
    "roles/run.admin",              # Cloud Run admin
    "roles/storage.admin",          # Container Registry access
    "roles/cloudbuild.builds.builder", # Cloud Build
    "roles/iam.serviceAccountUser", # Act as service account
    "roles/viewer",                 # Project Viewer
  ]
}

resource "google_project_iam_member" "github_actions_roles" {
  for_each = toset(local.github_actions_roles)

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Allow GitHub Actions to act as Cloud Run service account
resource "google_service_account_iam_member" "github_actions_act_as_cloud_run" {
  service_account_id = google_service_account.cloud_run.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.github_actions.email}"
}

# IAM roles for Cloud Run service account (minimal permissions)
locals {
  cloud_run_roles = [
    "roles/cloudsql.client",    # Cloud SQL access (if needed)
    "roles/secretmanager.secretAccessor", # Secret Manager access
  ]
}

resource "google_project_iam_member" "cloud_run_roles" {
  for_each = toset(local.cloud_run_roles)

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Service Account for Vercel (Next.js)
resource "google_service_account" "vercel" {
  account_id   = "vercel-${var.environment}"
  display_name = "Vercel Service Account (${var.environment})"
  description  = "Service account for Vercel/Next.js to call Cloud Run APIs"
  project      = var.project_id
}

# Service Account Key for Vercel (Next.js) - No IAM roles assigned
resource "google_service_account_key" "vercel_key" {
  service_account_id = google_service_account.vercel.name
  public_key_type    = "TYPE_X509_PEM_FILE"
}
