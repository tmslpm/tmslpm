
variable "github_token" {
  description = "GitHub Personal Access Token used for authenticating the API requests. This token should have sufficient permissions to interact with the repositories."
  type        = string
  nullable    = false
  sensitive   = true
  default     = ""
  validation {
    condition     = length(var.github_token) > 0
    error_message = "variable terraform \"github_token\" cannot be empty"
  }
}

variable "github_owner" {
  description = "The GitHub account (user or organization) that owns the repository. This can be a user or an organization name."
  type        = string
  nullable    = false
  sensitive   = false
  default     = ""
  validation {
    condition     = length(var.github_owner) > 0
    error_message = "variable terraform \"github_owner\" cannot be empty"
  }
}

variable "github_repository_name" {
  description = "The name of the GitHub repository to be managed by Terraform. It must be a valid repository name within the specified GitHub owner account."
  type        = string
  nullable    = false
  sensitive   = false
  default     = ""
  validation {
    condition     = length(var.github_repository_name) > 0
    error_message = "variable terraform \"github_repository_name\" cannot be empty"
  }
}

variable "github_repository_license" {
  description = "The license of the GitHub repository"
  nullable    = false
  sensitive   = false
  default     = ""
  validation {
    condition     = length(var.github_repository_license) > 0
    error_message = "variable terraform \"github_repository_license\" cannot be empty"
  }
}
