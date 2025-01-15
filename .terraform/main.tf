# 
# --------------------------------------------------------------
# First Setup:
#
# tf init --backend-config="./terraform.tfbackend" -backend-config="access_key=%BUCKET_ACCESS%" -backend-config="secret_key=%BUCKET_SECRET%"
# --------------------------------------------------------------
# Then:
#
# tf plan -var="github_token=%GITHUB_TOKEN%"
# 
# --------------------------------------------------------------
# 

terraform {
  required_version = ">= 1.6.3"
  backend "s3" {
    encrypt                     = true
    skip_credentials_validation = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_s3_checksum            = true

    # env
    secret_key = "" # (env var -> -backend-config="access_key= ... ")
    access_key = "" # (env var -> -backend-config="access_key= ... ")

    # partial
    endpoints = { s3 = "" } # (partial variable -> ./terraform.tfbackend)
    bucket    = ""          # (partial variable -> ./terraform.tfbackend)
    key       = ""          # (partial variable -> ./terraform.tfbackend)
    region    = ""          # (partial variable -> ./terraform.tfbackend) 
  }
}

variable "github_token" {
  description = "GitHub Personal Access Token used for authenticating the API requests. This token should have sufficient permissions to interact with the repositories."
}

module "gh-repository" {
  source                    = "./modules/gh-repository"
  github_token              = var.github_token
  github_repository_name    = "tmslpm"
  github_owner              = "tmslpm"
  github_repository_license = "arr"
}

