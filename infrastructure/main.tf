##################
# Resource Group #
##################

resource "azurerm_resource_group" "app" {
  name     = var.resource_group_name
  location = var.location
}

###################
# Virtual Network #
###################

resource "azurerm_virtual_network" "vnet" {
  name                = "${var.app_name}-vnet"
  resource_group_name = azurerm_resource_group.app.name
  location            = azurerm_resource_group.app.location
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "backend" {
  name                 = "${var.app_name}-backend-subnet"
  resource_group_name  = azurerm_resource_group.app.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.0.0/24"]
  delegation {
    name = "Microsoft.Web/serverFarms"
    service_delegation {
      actions = [ "Microsoft.Network/virtualNetworks/subnets/action" ]
      name    = "Microsoft.Web/serverFarms"
    }
  }
}

resource "azurerm_subnet" "storage" {
  name                 = "${var.app_name}-storage-subnet"
  resource_group_name  = azurerm_resource_group.app.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

############
# Frontend #
############

resource "azurerm_static_web_app" "frontend" {
  name                = "${var.app_name}-frontend"
  resource_group_name = azurerm_resource_group.app.name
  location            = azurerm_resource_group.app.location
}

resource "azurerm_static_web_app_custom_domain" "frontend" {
  static_web_app_id = azurerm_static_web_app.frontend.id
  validation_type   = "cname-delegation"
  domain_name       = cloudflare_dns_record.frontend.name
}

resource "cloudflare_dns_record" "frontend" {
  zone_id = var.cloudflare_zone_id
  name    = var.domain_name
  content = azurerm_static_web_app.frontend.default_host_name
  type    = "CNAME"
  ttl     = 1
  proxied = true
  tags    = ["terraform"]
}

###########
# Backend #
###########

resource "azurerm_storage_account" "backend" {
  name                      = "${var.app_name}storage"
  resource_group_name       = azurerm_resource_group.app.name
  location                  = azurerm_resource_group.app.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  shared_access_key_enabled = false
}

resource "azurerm_private_endpoint" "storage" {
  name                          = "${var.app_name}-storage-pe"
  resource_group_name           = azurerm_resource_group.app.name
  location                      = azurerm_resource_group.app.location
  subnet_id                     = azurerm_subnet.storage.id
  custom_network_interface_name = "${var.app_name}-storage-nic"

  private_dns_zone_group {
    name = "backend-storage"
    private_dns_zone_ids = [resource.azurerm_private_dns_zone.storage.id]
  }

  private_service_connection {
    name                           = "storage"
    private_connection_resource_id = azurerm_storage_account.backend.id
    subresource_names              = ["blob"]
    is_manual_connection           = false
  }
}

resource "azurerm_private_endpoint" "table" {
  name                          = "${var.app_name}-table-pe"
  resource_group_name           = azurerm_resource_group.app.name
  location                      = azurerm_resource_group.app.location
  subnet_id                     = azurerm_subnet.storage.id
  custom_network_interface_name = "${var.app_name}-table-nic"

  private_dns_zone_group {
    name = "backend-storage"
    private_dns_zone_ids = [resource.azurerm_private_dns_zone.storage.id]
  }

  private_service_connection {
    name                           = "storage"
    private_connection_resource_id = azurerm_storage_account.backend.id
    subresource_names              = ["table"]
    is_manual_connection           = false
  }
}

resource "azurerm_private_dns_zone" "storage" {
  name                = "privatelink.blob.core.windows.net"
  resource_group_name = azurerm_resource_group.app.name
}

resource "azurerm_private_dns_zone" "table" {
  name                = "privatelink.table.core.windows.net"
  resource_group_name = azurerm_resource_group.app.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "storage" {
  name                  = "${var.app_name}-storage-vnet-link"
  resource_group_name   = azurerm_resource_group.app.name
  private_dns_zone_name = azurerm_private_dns_zone.storage.name
  virtual_network_id    = azurerm_virtual_network.vnet.id
}

resource "azurerm_private_dns_zone_virtual_network_link" "table" {
  name                  = "${var.app_name}-table-vnet-link"
  resource_group_name   = azurerm_resource_group.app.name
  private_dns_zone_name = azurerm_private_dns_zone.table.name
  virtual_network_id    = azurerm_virtual_network.vnet.id
}

resource "azurerm_service_plan" "backend_plan" {
  name                = "${var.app_name}-backend-plan"
  location            = azurerm_resource_group.app.location
  resource_group_name = azurerm_resource_group.app.name
  os_type             = "Linux"
  sku_name            = var.backend_sku
}

resource "azurerm_linux_function_app" "backend" {
  name                          = "${var.app_name}-backend"
  resource_group_name           = azurerm_resource_group.app.name
  location                      = azurerm_resource_group.app.location
  service_plan_id               = azurerm_service_plan.backend_plan.id
  storage_account_name          = azurerm_storage_account.backend.name
  https_only                    = true
  storage_uses_managed_identity = true
  virtual_network_subnet_id     = azurerm_subnet.backend.id

  identity {
    type = "SystemAssigned"
  }
  
  site_config {
    minimum_tls_version = "1.3"

    cors {
      allowed_origins     = ["${var.domain_name}", "${azurerm_static_web_app.frontend.default_host_name}"]
      support_credentials = false
    }

    application_stack {
      node_version = "20"
    }
  }
}

resource "azurerm_role_assignment" "function_storage" {
  scope                = azurerm_storage_account.backend.id
  role_definition_name = "Storage Blob Data Owner"
  principal_id         = azurerm_linux_function_app.backend.identity[0].principal_id
}
