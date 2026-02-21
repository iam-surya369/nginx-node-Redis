aws_region           = "us-east-1"
project_name         = "nginx-node-redis"
Environment          = "dev"
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.11.0/24", "10.0.12.0/24"]
environments = {
  dev = {
    count = 1, size = "t3.micro"
    rules = [
      { port = 80, cidrs = ["0.0.0.0/0"], desc = "Public HTTP" },
      { port = 443, cidrs = ["0.0.0.0/0"], desc = "Public HTTPS" },
      { port = 6379, cidrs = ["0.0.0.0/0"], desc = "Public Redis" }
    ]
  }
}
ecr_names = {
  nodejs = { repo_name = "nginx-node-redis/nodejs-app", tag = "v1.0.0" }
  nginx  = { repo_name = "nginx-node-redis/nginx-app", tag = "v1.0.0" }
}
