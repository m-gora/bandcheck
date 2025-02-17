terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
    }
    azuread = {
      source  = "hashicorp/azuread"
    }
  }
}

provider "azurerm" {
  storage_use_azuread = true

  features {}
}

provider "cloudflare" {}

provider "azuread" {}
