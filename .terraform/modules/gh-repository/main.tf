
terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  token = var.github_token
  owner = var.github_owner
}

# Step:
# - import `terraform import github_repository.$github_name $repo_name`.
# - edit the resource github_repository
# - run `terraform init` (first time only); `terraform plan` and `terraform apply`.
resource "github_repository" "tmslpm" {
  name                 = var.github_repository_name
  description          = "Repository managed by Terraform!"
  topics               = ["terraform", "github", "cli"]
  license_template     = "mit"
  is_template          = true
  has_wiki             = false
  has_projects         = false
  has_downloads        = false
  has_issues           = true
  has_discussions      = true
  vulnerability_alerts = true

  security_and_analysis {
    secret_scanning {
      status = "enabled"
    }
    secret_scanning_push_protection {
      status = "enabled"
    }
  }
}

resource "github_repository_dependabot_security_updates" "tmslpm" {
  repository = var.github_repository_name
  enabled    = true
}
