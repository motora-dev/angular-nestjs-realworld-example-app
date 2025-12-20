output "secret_names" {
  description = "Map of secret names"
  value       = {
    for k, v in google_secret_manager_secret.secrets : k => v.name
  }
}
