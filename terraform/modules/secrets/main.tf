# Secrets management using Google Secret Manager

# Define list of secrets to create
locals {
  secrets = [
    "database-url",
    "supabase-url",
    "supabase-service-role-key",
    "cors-origins",
    "domain",
    "cookie-domain",
    "basic-auth-user",
    "basic-auth-password",
    "allowed-emails",
    "isr-secret"
  ]
}

resource "google_secret_manager_secret" "secrets" {
  for_each = toset(local.secrets)

  secret_id = each.value
  project   = var.project_id

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }

  replication {
    auto {}
  }
}

# Grant Cloud Run service account access to secrets
resource "google_secret_manager_secret_iam_member" "cloud_run_secrets" {
  for_each = toset(local.secrets)

  project   = var.project_id
  secret_id = google_secret_manager_secret.secrets[each.value].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.cloud_run_service_account_email}"
}
