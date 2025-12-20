output "provider_name" {
  description = "Workload Identity Provider resource name"
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "pool_name" {
  description = "Workload Identity Pool resource name"
  value       = google_iam_workload_identity_pool.github.name
}
