terraform {
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "2.5.2"
    }
  }
}

variable "my_var_count" {
  description = "awesome human description"
  type        = number
  sensitive   = false
  nullable    = false
  ephemeral   = false
  default     = 5
  validation {
    condition     = var.my_var_count >= 1 && var.my_var_count <= 100
    error_message = "my_var_count must be between 1 and 100 inclusive."
  }
}

locals {
  result = {
    for i in range(var.my_var_count) : format("%s%02d", "i-", i) => i
  }
}

output "out_result" {
  description = "output variable \"result\""
  value       = local.result
}
