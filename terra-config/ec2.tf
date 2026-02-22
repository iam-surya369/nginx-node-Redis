resource "aws_instance" "servers" {
  for_each = { for instance in local.instances : instance.name => instance }

  ami           = data.aws_ami.ubuntu.id
  instance_type = each.value.size

  # If servers need to be deployed based on environment
  # associate_public_ip_address = each.value.env == "dev" ? true : false
  # subnet_id = element(
  #   each.value.env == "prod" || each.value.env == "stage" ? module.vpc.private_subnets : module.vpc.public_subnets,
  #   tonumber(reverse(split("-", each.key))[0]) - 1
  # )

  # If all the servers needs to be deployed in public subnets
  associate_public_ip_address = true
  subnet_id = element(
    module.vpc.public_subnets, tonumber(reverse(split("-", each.key))[0]) - 1
  )

  iam_instance_profile   = aws_iam_instance_profile.instance_profile.name
  key_name               = data.aws_key_pair.keypair.key_name
  vpc_security_group_ids = [aws_security_group.env_sgs[each.value.env].id]

  user_data = templatefile("${path.module}/../scripts/setup.tftpl", {
    account_id      = data.aws_caller_identity.current.account_id
    region          = var.aws_region
    nodejs_ecr_name = var.ecr_names["nodejs"].repo_name
    nodejs_ecr_tag  = var.ecr_names["nodejs"].tag
    nginx_ecr_name  = var.ecr_names["nginx"].repo_name
    nginx_ecr_tag   = var.ecr_names["nginx"].tag
  })

  tags = merge(local.common_tags, {
    Name        = each.key
    Environment = each.value.env
  })

  lifecycle {
    ignore_changes = [
      user_data
    ]
  }
}
