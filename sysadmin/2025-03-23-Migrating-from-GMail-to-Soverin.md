# Migrating from GMail to Soverin

I registered my domain almost exactly 25 years ago, in large part because I didn't want to have to change my email address ever again. After self-hosting for a few years, I started using "Google Apps for your Domain" (now known as Google Workspace) in 2006 or so, and have been using it every since.

This weekend I migrated my email to [Soverin](https://soverin.com/). For €3.25 a month, you can get email + CalDAV hosting with 25GB of storage from an EU-based company. Not bad!

I ran into a few issues with my setup and thought I'd write them up here.

## Importing from GMail

After signing up, I wanted to import my email from GMail before changing the DNS records. I created a new app password especially for Soverin and started a new import (under _My mailbox_ > _Import email_). But it kept showing the status "Verification failed".

I eventually realized that it was failing because I hadn't yet verified my _domain_. (I'm not sure why that's required before importing email.) Fixing this was easy ([How to connect your existing custom domain](https://soverin.com/help/domain-custom-add)) and afterwards my GMail import ran successfully.

## Problems with the Cloudflare SPF record

After that, I was able to connect to the Soverin IMAP server with Apple Mail. Then, I updated all my DNS records so that my mail would be delivered to Soverin rather than GMail. This all worked fine.

What didn't work was _sending_ email from Apple Mail. DNS for my domain is handled by Cloudflare, and I had replaced my old SPF record with the new one for Soverin. However, Apple Mail was giving an SPF error when I tried to send an email from my account.

I tried the [EasyDMARC SPF Checker](https://easydmarc.com/tools/spf-lookup), and it gave an error related to the quotation marks. It turns out that the Cloudflare UI [automatically adds quotation marks around TXT records](https://community.cloudflare.com/t/cant-remove-quotes-from-txt-record/737786). And apparently this was causing problems with Soverin's SPF check.

The workaround I found is to create the record via the API. I created a new API token, and [found the zone ID](https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids/). I put both of these into environment variables and then ran the following:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID_DUBROY_COM/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_DNS_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
  "type": "TXT",
  "name": "@",
  "content": "v=spf1 include:soverin.net ~all",
  "ttl": 60
  }'
```

Everything worked after that. 🙌
