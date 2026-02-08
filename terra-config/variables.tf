variable "aws_region" {
  type    = string
  default = "us-east-1"
}
variable "project_name" {
  default = "web-app"
}
variable "Environment" {
  type    = string
  default = "dev"
}
variable "vpc_cidr" {
  default = "10.0.0.0/16"
}
variable "public_subnet_cidrs" {
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}
variable "private_subnet_cidrs" {
  default = ["10.0.11.0/24", "10.0.12.0/24"]
}
variable "environments" {
  description = "Configuration for each environment including instance size and port rules"
  type = map(object({
    count = number
    size  = string
    rules = list(object({
      port  = number
      cidrs = list(string)
      desc  = string
    }))
  }))
}
variable "ecr_name" {
  default = "nginx-node-redis"
}
