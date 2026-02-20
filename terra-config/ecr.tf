resource "aws_ecr_repository" "repos" {
  for_each             = var.ecr_names
  name                 = each.value.repo_name
  image_tag_mutability = "MUTABLE"
  force_delete         = true
  encryption_configuration {
    encryption_type = "KMS"
  }
}
