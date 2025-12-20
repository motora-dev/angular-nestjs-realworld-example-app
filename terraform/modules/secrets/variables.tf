variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "cloud_run_service_account_email" {
  description = "Cloud Run service account email"
  type        = string
}
