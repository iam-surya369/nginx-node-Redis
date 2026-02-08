locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.Environment
    ManagedBy   = "Terraform"
  }

  # We pull from var.environments instead of a hardcoded map
  instances = flatten([
    for env_name, config in var.environments : [
      for i in range(config.count) : {
        name = "${env_name}-server-${i + 1}"
        env  = env_name
        size = config.size
      }
    ]
  ])

  sg_rules = flatten([
    for env_name, config in var.environments : [
      for rule in config.rules : {
        key   = "${env_name}-${rule.port}"
        env   = env_name
        port  = rule.port
        cidrs = rule.cidrs
        desc  = rule.desc
      }
    ]
  ])
}
