terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
    }
  }
}

provider "azurerm" {
  features {}
}

provider "cloudflare" {
}
