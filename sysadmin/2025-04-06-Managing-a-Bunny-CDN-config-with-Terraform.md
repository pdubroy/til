# Managing a Bunny CDN config with Terraform

I'm moving my web site over to [Bunny](https://bunny.net/), and have a bunch of redirect rules in my nginx config that I wanted to turn into Edge Rules. The thought of doing them by hand in the GUI made me sad, but Bunny has an [official Terraform provider](https://registry.terraform.io/providers/BunnyWay/bunnynet/latest/docs), so I decided to give that a try.

_Caveat: I'm not a Terraform expert, so take this with a grain of salt!_

## Getting started

I installed Terraform via Homebrew: `brew tap hashicorp/tap && brew install hashicorp/tap/terraform`. Then, my first goal was to come up with a "no-op" Terraform config — something where running `terraform apply` wouldn't make any changes. Here's my config (in main.tf):

```tf
terraform {
  required_providers {
    bunnynet = {
      source = "BunnyWay/bunnynet"
    }
  }
}

variable "bunnynet_api_key" {
  type = string
}

provider "bunnynet" {
  api_key = var.bunnynet_api_key
}

import {
  to = bunnynet_storage_zone.dubroy
  id = 1234567
}

resource "bunnynet_storage_zone" "dubroy" {
  name      = "dubroy"
  region    = "DE"
  zone_tier = "Edge"
  replication_regions = [
    "BR",
    "NY",
    "SG",
    "WA",
  ]
}

import {
  to = bunnynet_pullzone.dubroy
  id = 7654321
}

resource "bunnynet_pullzone" "dubroy" {
  name = "dubroy"

  origin {
    type        = "StorageZone"
    storagezone = bunnynet_storage_zone.dubroy.id
    host_header = "dubroy.com"
  }

  routing {
    tier = "Standard"
    zones = [
      "EU",
      "US",
      "ASIA"
    ]
  }
}

import {
  to = bunnynet_pullzone_hostname.dubroycom
  id = "7654321|dubroy.com"
}

resource "bunnynet_pullzone_hostname" "dubroycom" {
  pullzone    = bunnynet_pullzone.dubroy.id
  name        = "dubroy.com"
  tls_enabled = true
  force_ssl   = true
}
```

Notes:
- This assumes your Bunny API key is in an environment variable named `TF_VAR_bunnynet_api_key`.
- You'll need to replace `1234567` and `7654321` with proper ID of your storage zone and pull zone, respectively. You can find those in the Bunny control panel.
- If you don't have an existing pull zone / storage zone, you can remove the `import` blocks altogether.

## Next steps

- `terraform init` to initialize
- `terraform plan` to see what actions Terraform would take. I iterated on this until there were 0 changes, only imports:
  ```
  Plan: 5 to import, 5 to add, 0 to change, 0 to destroy.
  ```
- `terraform apply`

I committed these two files:
- `main.tf`
- `.terraform.lock.hcl`

And updated my .gitignore to ignore the others:

```
.terraform
terraform.tfstate*
```

## Edge rules

Here's an example of defining an edge rule, based one of Gabriel Garrido's [Bunny CDN Edge Rules for HTML canonical URLs](https://garrido.io/notes/bunny-edge-rules-for-html-canonical-urls/):

```tf
resource "bunnynet_pullzone_edgerule" "strip_index" {
  enabled     = true
  pullzone    = bunnynet_pullzone.dubroy.id
  description = "Strip index.html"

  actions = [
    {
      type       = "Redirect"
      parameter1 = "https://%%{Url.Hostname}%%{Url.Directory}"
      parameter2 = "301"
      parameter3 = null
    }
  ]

  match_type = "MatchAll"
  triggers = [
    {
      type       = "Url"
      match_type = "MatchAny"
      patterns = [
        "*/index.html*",
      ]
      parameter1 = null
      parameter2 = null
    },
    {
      match_type = "MatchNone"
      patterns = [
        "?*=*",
      ]
      type       = "UrlQueryString"
      parameter1 = null
      parameter2 = null
    },
  ]
}
```

Notes:
- You can import an existing edge rule like so:
  ```
  import {
    to = bunnynet_pullzone_edgerule.strip_index
    id = "7654321|40235ee2-4468-4023-5383-8aeee29073ac"
  }
  ```
  …where `7654321` is your pull zone ID, and the rest is the edge rule GUID, which you can get from the URL if you edit the rule in the Bunny control panel.
- Bunny appears to support a maximum of 5 patterns per trigger, and 5 triggers per rule.
