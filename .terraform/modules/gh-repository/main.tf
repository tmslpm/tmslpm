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

resource "github_repository" "tmslpm" {
  name        = var.github_repository_name
  description = "Repository managed by Terraform!"
  topics      = ["terraform", "github", "cli"]

  is_template        = false
  has_wiki           = false
  has_projects       = false
  has_downloads      = false
  has_issues         = true
  has_discussions    = false
  archive_on_destroy = false

  vulnerability_alerts = true

  security_and_analysis {
    secret_scanning {
      status = "enabled"
    }
    secret_scanning_push_protection {
      status = "enabled"
    }
  }

  #pages {
  #  build_type = "workflow"
  #  source {
  #    branch = "main"
  #    path   = "/dist"
  #  }
  #}
}

resource "github_repository_dependabot_security_updates" "tmslpm" {
  repository = var.github_repository_name
  enabled    = true
}

