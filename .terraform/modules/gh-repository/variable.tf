
variable "github_token" {
  description = <<EOT
    GitHub Personal Access Token used for authenticating the
    API requests. This token should have sufficient permissions
    to interact with the repositories
  EOT 

  type      = string
  nullable  = false
  sensitive = true
  default   = ""

  validation {
    condition     = length(var.github_token) > 0
    error_message = "variable \"github_token\" cannot be empty"
  }
}

variable "github_owner" {
  description = <<EOT
    The GitHub account (user or organization) that owns the 
    repository. This can be a user or an organization name.
  EOT 

  type      = string
  nullable  = false
  sensitive = false
  default   = ""

  validation {
    condition     = length(var.github_owner) > 0
    error_message = "variable \"github_owner\" cannot be empty"
  }
}

variable "github_repository_name" {
  description = <<EOT
    The name of the GitHub repository to be managed by Terraform. 
    It must be a valid repository name within the specified GitHub 
    owner account.
  EOT 

  type      = string
  nullable  = false
  sensitive = false
  default   = ""

  validation {
    condition     = length(var.github_repository_name) > 0
    error_message = "variable \"github_repository_name\" cannot be empty"
  }
}

variable "github_repository_license" {
  description = "The license of the GitHub repository"
  nullable    = false
  sensitive   = false
  default     = ""

  validation {
    condition     = length(var.github_repository_license) > 0
    error_message = "variable \"github_repository_license\" cannot be empty"
  }
}
