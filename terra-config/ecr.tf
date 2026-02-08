resource "aws_ecr_repository" "name" {
  name                 = var.ecr_name
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}
