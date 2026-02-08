terraform {
  backend "s3" {
    bucket       = "my-terra-projects"
    region       = "us-east-1"
    key          = "nginx-node-redis/terraform.tfstate"
    encrypt      = true
    use_lockfile = true
  }
}
