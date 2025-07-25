# Traefik

> **Reverse proxy and SSL termination**

Traefik provides automatic SSL certificates and subdomain routing for production deployments.

## Overview

- **Ports**: 80 (HTTP), 443 (HTTPS), 8080 (Dashboard)
- **Image**: `traefik:v3.0`
- **Purpose**: Reverse proxy, SSL certificates, subdomain routing
- **Status**: Production only (disabled by default)

## Configuration

### Enable Traefik
```bash
ENABLE_TRAEFIK=yes
BASE_DOMAIN_NAME=your-domain.com
TRAEFIK_EMAIL=admin@your-domain.com
```

### Requirements
- **Domain**: Must point to server IP
- **Ports**: 80 and 443 open to internet
- **Email**: For Let's Encrypt certificates

## Features

### Automatic SSL
- **Let's Encrypt**: Free SSL certificates
- **Auto Renewal**: Certificates renew automatically
- **HTTPS Redirect**: HTTP automatically redirects to HTTPS

### Subdomain Routing
```bash
# Services available as subdomains
n8n.your-domain.com
chat.your-domain.com
flowise.your-domain.com
eliza.your-domain.com
cambrian.your-domain.com
mcp.your-domain.com
```

### Dashboard
- **URL**: http://localhost:8080 (when enabled)
- **Purpose**: Monitor routes and services
- **Security**: Disabled by default in production

## Usage

### Production Setup
1. **Point Domain**: Configure DNS A record
2. **Enable Traefik**: Set environment variables
3. **Deploy**: Run bootstrap script
4. **Verify**: Check SSL certificates

### Custom Subdomains
```bash
# Optional custom subdomains
N8N_SUBDOMAIN=automation
OPENWEBUI_SUBDOMAIN=chat
FLOWISE_SUBDOMAIN=agents
```

## Troubleshooting

### SSL Certificate Issues
```bash
# Check Traefik logs
docker logs seiling-traefik

# Verify domain resolution
nslookup your-domain.com

# Check certificate status
curl -I https://your-domain.com
```

### Routing Issues
```bash
# Check service labels
docker inspect seiling-n8n | grep -A5 Labels

# Verify Traefik configuration
docker logs seiling-traefik --tail=50
```

### Common Problems
- **DNS not propagated**: Wait 24 hours
- **Firewall blocking**: Open ports 80/443
- **Rate limiting**: Let's Encrypt has limits

---

**Traefik enables production deployments with SSL.** Only needed for public-facing installations. 