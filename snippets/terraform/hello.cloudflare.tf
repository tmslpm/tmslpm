terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4"
    }
  }
}

variable "cloudflare_token" {
  description = "Cloudflare Global API Key"
  type      = string
  sensitive = true
}

variable "cloudflare_email" { 
  description = "Cloudflare Account Email"
  type      = string
  sensitive = true
}

provider "cloudflare" {
  api_key = var.cloudflare_token
  email   = var.cloudflare_email
}
