
module "gh-repository" {
  source                    = "./modules/gh-repository"
  github_token              = var.github_token
  github_repository_name    = "tmslpm"
  github_owner              = "tmslpm"
  github_repository_license = "arr"
}
 
