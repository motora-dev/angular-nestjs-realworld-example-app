# Secrets management using Google Secret Manager

# Define list of secrets to create
locals {
  secret_names = [
    "database-url",
    "cors-origins",
    "cookie-domain",
    "basic-auth-user",
    "basic-auth-password",
    "isr-secret",
    "session-secret-token"
  ]

  # Add service_name prefix to secret names
  secrets = {
    for name in local.secret_names : name => "${var.service_name}-${name}"
  }
}

resource "google_secret_manager_secret" "secrets" {
  for_each = local.secrets

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
  for_each = local.secrets

  project   = var.project_id
  secret_id = google_secret_manager_secret.secrets[each.key].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.cloud_run_service_account_email}"
}
