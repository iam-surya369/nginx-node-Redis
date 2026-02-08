# Create one SG for each environment
resource "aws_security_group" "env_sgs" {
  for_each    = var.environments
  name        = "${var.project_name}-${each.key}-sg"
  description = "Security Group for ${each.key} environment"
  vpc_id      = module.vpc.vpc_id

  tags = merge(local.common_tags, { Name = "${var.project_name}-${each.key}-sg" })
}

# Attach the multi-port/multi-CIDR rules to the correct SGs
resource "aws_security_group_rule" "ingress_rules" {
  for_each = { for r in local.sg_rules : r.key => r }

  type              = "ingress"
  from_port         = each.value.port
  to_port           = each.value.port
  protocol          = "tcp"
  cidr_blocks       = each.value.cidrs
  description       = each.value.desc
  security_group_id = aws_security_group.env_sgs[each.value.env].id
}

# Standard Egress rule (Allow all outbound) for all SGs
resource "aws_security_group_rule" "egress_all" {
  for_each          = aws_security_group.env_sgs
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = each.value.id
}
