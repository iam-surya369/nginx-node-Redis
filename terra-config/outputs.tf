output "instance_details" {
  description = "Map of instance names to their public IP and environment"
  value = {
    for name, instance in aws_instance.servers : name => {
      public_ip   = instance.public_ip
      instance_id = instance.id
      environment = instance.tags["Environment"]
    }
  }
}
