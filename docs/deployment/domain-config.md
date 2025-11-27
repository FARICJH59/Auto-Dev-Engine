# Vercel Domain + DNS + SSL Configuration Guide

This document provides comprehensive instructions for configuring custom domains, DNS, and SSL certificates with Vercel for the **rugged-silo** project.

---

## Table of Contents

1. [DNS Lookup Flow](#dns-lookup-flow)
2. [Vercel DNS Architecture](#vercel-dns-architecture)
3. [Adding Custom Domains](#adding-custom-domains)
4. [DNS Record Types: A vs CNAME vs ALIAS/ANAME](#dns-record-types-a-vs-cname-vs-aliasaname)
5. [Nameservers, Propagation, and TTL](#nameservers-propagation-and-ttl)
6. [Automatic SSL Issuance via Let's Encrypt](#automatic-ssl-issuance-via-lets-encrypt)
7. [Domain Ownership Verification](#domain-ownership-verification)
8. [Debugging Commands](#debugging-commands)
9. [Best Practices](#best-practices)

---

## DNS Lookup Flow

When a user visits your custom domain, the DNS resolution follows this flow:

1. **User's browser** sends a DNS query to the configured resolver (e.g., ISP, Google DNS, Cloudflare).
2. **Recursive resolver** checks its cache; if not cached, it queries authoritative nameservers.
3. **Root nameservers** direct to the TLD nameservers (e.g., `.com`, `.io`).
4. **TLD nameservers** direct to your domain's authoritative nameservers.
5. **Authoritative nameservers** return the IP address or CNAME record.
6. **Browser** connects to the resolved IP address, which routes to Vercel's edge network.

```
User Browser → Recursive Resolver → Root NS → TLD NS → Authoritative NS → Vercel Edge
```

---

## Vercel DNS Architecture

Vercel uses an **Anycast CDN** architecture to provide fast, reliable deployments worldwide:

### Key Components

- **Anycast IP**: Vercel's primary IPv4 apex target is `76.76.21.21`. This single IP routes to the nearest Vercel edge location.
- **Edge Network**: Vercel operates a global network of edge servers that cache and serve your content.
- **Automatic Failover**: If one edge location fails, traffic automatically routes to the next closest.

### Vercel's IPv4 Apex Target: `76.76.21.21`

For **apex domains** (e.g., `example.com` without `www`), you must use:

| Record Type | Host | Value |
|-------------|------|-------|
| A | @ | `76.76.21.21` |

This IP is Vercel's anycast address, which routes traffic to the nearest edge server globally.

### CNAME for Subdomains

For subdomains (e.g., `www.example.com`), use a CNAME pointing to:

```
cname.vercel-dns.com
```

---

## Adding Custom Domains

### Via Vercel Dashboard

1. Navigate to your project on [vercel.com](https://vercel.com)
2. Go to **Settings** → **Domains**
3. Enter your custom domain and click **Add**
4. Follow the DNS configuration instructions provided
5. Vercel will automatically verify DNS and issue an SSL certificate

### Via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Add a domain to your project
vercel domains add yourdomain.com

# Add a domain to a specific project
vercel domains add yourdomain.com --project rugged-silo

# List all domains
vercel domains ls

# Inspect a domain
vercel domains inspect yourdomain.com

# Remove a domain
vercel domains rm yourdomain.com
```

---

## DNS Record Types: A vs CNAME vs ALIAS/ANAME

### When to Use Each Record Type

| Record Type | Use Case | Example |
|-------------|----------|---------|
| **A** | Apex domain (`example.com`) | Points to `76.76.21.21` |
| **CNAME** | Subdomains (`www.example.com`) | Points to `cname.vercel-dns.com` |
| **ALIAS/ANAME** | Apex domain (when your DNS provider supports it) | Points to `cname.vercel-dns.com` |

### Detailed Recommendations

#### A Record (for Apex Domains)
```
Type: A
Host: @ (or leave blank)
Value: 76.76.21.21
TTL: 300 (or automatic)
```

#### CNAME Record (for Subdomains)
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: 300 (or automatic)
```

#### ALIAS/ANAME (for Apex Domains with Supporting DNS Providers)

Some DNS providers (Cloudflare, DNSimple, Route 53) support ALIAS/ANAME records:
```
Type: ALIAS (or ANAME)
Host: @ (or leave blank)
Value: cname.vercel-dns.com
TTL: 300 (or automatic)
```

**Note**: ALIAS/ANAME is preferred for apex domains when available, as it allows Vercel to return multiple IP addresses for better load balancing.

---

## Nameservers, Propagation, and TTL

### DNS Propagation

DNS changes can take time to propagate globally:

- **Typical propagation time**: 1-48 hours
- **TTL-dependent**: Lower TTL = faster propagation
- **Cached entries**: Old records may persist until cache expires

### TTL (Time-To-Live) Recommendations

| Scenario | Recommended TTL |
|----------|-----------------|
| Initial setup | 300 seconds (5 min) |
| Stable production | 3600 seconds (1 hour) |
| Pre-migration | 60-300 seconds |

### Using Vercel Nameservers

For best performance, consider using Vercel's nameservers:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

Benefits:
- Automatic DNS configuration
- Faster SSL certificate issuance
- Simplified domain management

---

## Automatic SSL Issuance via Let's Encrypt

Vercel automatically provisions SSL certificates using Let's Encrypt:

### How It Works

1. **Domain Added**: When you add a domain to Vercel
2. **DNS Verification**: Vercel verifies DNS is correctly configured
3. **Certificate Request**: Vercel requests a certificate from Let's Encrypt
4. **Automatic Renewal**: Certificates are renewed automatically before expiration

### SSL Certificate Details

- **Certificate Authority**: Let's Encrypt
- **Validity**: 90 days
- **Renewal**: Automatic (typically 30 days before expiration)
- **Coverage**: Both apex and www subdomains

### Verifying SSL Status

```bash
# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com </dev/null 2>/dev/null | openssl x509 -noout -dates

# Quick HTTPS test
curl -I https://yourdomain.com
```

---

## Domain Ownership Verification

Vercel may require domain ownership verification for certain domains:

### Verification Methods

1. **TXT Record Verification**
   ```
   Type: TXT
   Host: _vercel
   Value: vc-domain-verify=<verification-code>
   ```

2. **CNAME Verification** (alternative)
   ```
   Type: CNAME
   Host: _vercel
   Value: <verification-value>.vercel-dns.com
   ```

### Check Verification Status

```bash
# Via CLI
vercel domains inspect yourdomain.com

# Via DNS lookup
dig TXT _vercel.yourdomain.com
```

---

## Debugging Commands

### DNS Lookup Commands

```bash
# Basic DNS lookup
dig yourdomain.com

# Query specific record types
dig A yourdomain.com
dig CNAME www.yourdomain.com
dig TXT _vercel.yourdomain.com

# Query against specific DNS server
dig @8.8.8.8 yourdomain.com          # Google DNS
dig @1.1.1.1 yourdomain.com          # Cloudflare DNS
dig @ns1.vercel-dns.com yourdomain.com  # Vercel DNS

# Short output
dig +short yourdomain.com

# Trace DNS resolution path
dig +trace yourdomain.com

# Check authoritative nameservers
dig NS yourdomain.com
```

### HTTP/HTTPS Testing

```bash
# Test HTTP response
curl -I http://yourdomain.com

# Test HTTPS response
curl -I https://yourdomain.com

# Follow redirects
curl -IL http://yourdomain.com

# Verbose output
curl -v https://yourdomain.com
```

### SSL Certificate Debugging

```bash
# View full certificate chain
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# View certificate details
echo | openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -text -noout

# Check certificate expiration
echo | openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -noout -dates

# Check certificate issuer
echo | openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -noout -issuer
```

### Vercel CLI Debugging

```bash
# Check project domains
vercel domains ls

# Inspect specific domain
vercel domains inspect yourdomain.com

# Check project status
vercel project ls

# View deployment logs
vercel logs
```

---

## Best Practices

### 1. Pre-Deployment Checklist

- [ ] Verify domain ownership
- [ ] Configure DNS records correctly
- [ ] Wait for DNS propagation (check with `dig`)
- [ ] Confirm SSL certificate is issued
- [ ] Test both HTTP and HTTPS access

### 2. DNS Configuration

- Use **A record** for apex domains pointing to `76.76.21.21`
- Use **CNAME** for subdomains pointing to `cname.vercel-dns.com`
- Use **ALIAS/ANAME** for apex if your DNS provider supports it
- Keep TTL low during initial setup (300 seconds)
- Increase TTL after stable configuration (3600+ seconds)

### 3. SSL Best Practices

- Always force HTTPS redirects
- Verify certificate chain is complete
- Monitor certificate expiration (Vercel handles renewal automatically)
- Test with multiple browsers and devices

### 4. Monitoring and Maintenance

- Set up uptime monitoring for your domain
- Subscribe to Vercel status updates
- Regularly verify DNS configuration
- Keep contact information updated at your registrar

### 5. Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| DNS not resolving | Wait for propagation; check TTL settings |
| SSL certificate pending | Verify DNS is correctly configured |
| Mixed content warnings | Ensure all resources use HTTPS |
| Domain verification failed | Add required TXT/CNAME record |
| 404 errors after domain add | Check deployment status and domain mapping |

---

## Quick Reference

### Required DNS Records for Vercel

| Domain Type | Record | Host | Value |
|-------------|--------|------|-------|
| Apex (`example.com`) | A | @ | `76.76.21.21` |
| WWW (`www.example.com`) | CNAME | www | `cname.vercel-dns.com` |
| Verification | TXT | _vercel | `vc-domain-verify=<code>` |

### Essential CLI Commands

```bash
vercel login              # Authenticate with Vercel
vercel domains add <dom>  # Add a domain
vercel domains ls         # List all domains
vercel domains inspect <dom>  # Check domain status
dig +short <domain>       # Quick DNS check
```

---

## Related Resources

- [Vercel Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Vercel DNS Reference](https://vercel.com/docs/concepts/projects/domains/dns)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [DNS Checker Tool](https://dnschecker.org/)

---

*Last updated: 2024*
