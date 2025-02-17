locals {
  origin_urls = ["${var.domain_name}", "${azurerm_static_web_app.frontend.default_host_name}"]
}
