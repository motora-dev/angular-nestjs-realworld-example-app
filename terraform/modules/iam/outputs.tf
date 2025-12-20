output "github_actions_service_account_email" {
  description = "Email of the GitHub Actions service account"
  value       = google_service_account.github_actions.email
}

output "cloud_run_service_account_email" {
  description = "Email of the Cloud Run service account"
  value       = google_service_account.cloud_run.email
}

output "vercel_service_account_email" {
  description = "Email of the Vercel service account"
  value       = google_service_account.vercel.email
}

output "vercel_service_account_key" {
  description = "Vercel service account private key (JSON format)"
  value       = base64decode(google_service_account_key.vercel_key.private_key)
  sensitive   = true
}
