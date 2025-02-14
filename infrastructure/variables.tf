variable "resource_group_name" {
  description = "The name of the resource group in which the resources will be created."
  type = string
}

variable "location" {
  description = "The Azure region in which the resources will be created."
  type = string
}

variable "app_name" {
  description = "The name of the web app."
  type = string
}

variable "backend_sku" {
  description = "The SKU of the App Service Plan for the backend."
  type = string
}

variable "domain_name" {
  description = "The domain name to use for the frontend."
  type = string
}

variable "cloudflare_zone_id" {
  description = "The ID of the Cloudflare zone."
  type = string
}
