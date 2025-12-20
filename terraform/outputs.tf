output "github_actions_service_account" {
  description = "GitHub Actions service account email"
  value       = module.iam.github_actions_service_account_email
}

output "cloud_run_service_account" {
  description = "Cloud Run service account email"
  value       = module.iam.cloud_run_service_account_email
}

output "workload_identity_provider" {
  description = "Workload Identity Provider resource name"
  value       = module.wif.provider_name
}

# Output for GitHub Secrets
output "github_secrets_setup" {
  description = "Values for GitHub Secrets"
  value = {
    WIF_PROVIDER        = module.wif.provider_name
    WIF_SERVICE_ACCOUNT = module.iam.github_actions_service_account_email
  }
}

# Output for Vercel Environment Variable
output "vercel_credentials_json" {
  description = "Vercel GOOGLE_APPLICATION_CREDENTIALS_JSON (use with jq -c for compact format)"
  value       = module.iam.vercel_service_account_key
  sensitive   = true
}
