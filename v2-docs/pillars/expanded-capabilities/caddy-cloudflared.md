# Caddy & Cloudflared - Reverse Proxy & Tunneling

## Overview

Caddy and Cloudflared provide modern alternatives to Traefik for reverse proxying, SSL termination, and secure service exposure. Caddy offers automatic HTTPS with Let's Encrypt, while Cloudflared provides zero-trust tunneling without exposing public ports.

## Features

### Caddy
- **Automatic HTTPS**: Zero-config SSL certificates via Let's Encrypt
- **Reverse Proxy**: Route multiple services through a single entry point
- **Security Headers**: Built-in security headers (HSTS, CSP, etc.)
- **Load Balancing**: Distribute traffic across multiple instances
- **Modern Caddyfile**: Simple, readable configuration

### Cloudflared
- **Zero-Trust Tunneling**: Secure tunnels without public IPs
- **Global Routing**: Cloudflare's global network
- **No Port Exposure**: Services remain private
- **Easy Setup**: Token-based configuration

## Setup

### Enable Caddy

1. **Set environment variables in `.env`:**
   ```bash
   ENABLE_CADDY=yes
   LETSENCRYPT_EMAIL=your-email@example.com
   # Service hostnames (ports or domains)
   N8N_HOSTNAME=:8001
   WEBUI_HOSTNAME=:8002
   CAPTAIN_HOSTNAME=:8003
   LANGFUSE_HOSTNAME=:8004
   GRAFANA_HOSTNAME=:8005
   SEARXNG_HOSTNAME=:8006
   ```

2. **Deploy service:**
   ```bash
   ./bootstrap.sh
   ```

### Enable Cloudflared (Optional)

1. **Create Cloudflare tunnel:**
   - Go to Cloudflare Zero Trust dashboard
   - Create a new tunnel
   - Copy the tunnel token

2. **Set environment variables in `.env`:**
   ```bash
   ENABLE_CLOUDFLARED=yes
   CLOUDFLARED_TUNNEL_TOKEN=your-tunnel-token-here
   ```

3. **Deploy service:**
   ```bash
   ./bootstrap.sh
   ```

## Access

### With Caddy

If using ports (localhost):
- **n8n**: http://localhost:8001
- **OpenWebUI**: http://localhost:8002
- **Captain**: http://localhost:8003
- **Langfuse**: http://localhost:8004
- **Grafana**: http://localhost:8005
- **SearXNG**: http://localhost:8006

If using domains:
- Services accessible via configured domains with automatic HTTPS

### With Cloudflared

- Services accessible via Cloudflare tunnel URL
- No local port exposure required
- Global access via Cloudflare network

## Configuration

### Caddy Configuration

Caddyfile is located at `docker/caddy/Caddyfile`:

```caddyfile
{
    email ${LETSENCRYPT_EMAIL:-internal}
    auto_https disable_redirects
}

# N8N
{$N8N_HOSTNAME} {
    reverse_proxy n8n:5678
}

# OpenWebUI
{$WEBUI_HOSTNAME} {
    reverse_proxy openwebui:8080
}

# Add security headers globally
header {
    Strict-Transport-Security "max-age=31536000;"
    X-Content-Type-Options "nosniff"
    X-Frame-Options "DENY"
}
```

### Using Domains

For production with domains:

```caddyfile
n8n.yourdomain.com {
    reverse_proxy n8n:5678
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }
}

webui.yourdomain.com {
    reverse_proxy openwebui:8080
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_CADDY` | Enable/disable Caddy | `no` |
| `LETSENCRYPT_EMAIL` | Email for Let's Encrypt | (empty) |
| `N8N_HOSTNAME` | n8n hostname/port | `:8001` |
| `WEBUI_HOSTNAME` | OpenWebUI hostname/port | `:8002` |
| `CAPTAIN_HOSTNAME` | Captain hostname/port | `:8003` |
| `LANGFUSE_HOSTNAME` | Langfuse hostname/port | `:8004` |
| `GRAFANA_HOSTNAME` | Grafana hostname/port | `:8005` |
| `SEARXNG_HOSTNAME` | SearXNG hostname/port | `:8006` |
| `ENABLE_CLOUDFLARED` | Enable/disable Cloudflared | `no` |
| `CLOUDFLARED_TUNNEL_TOKEN` | Cloudflare tunnel token | (empty) |

## Advanced Configuration

### Rate Limiting

Add rate limiting in Caddyfile:

```caddyfile
{$N8N_HOSTNAME} {
    rate_limit {
        zone static {
            key {remote_host}
            window 1m
            events 100
        }
    }
    reverse_proxy n8n:5678
}
```

### Access Control

Add basic auth:

```caddyfile
{$N8N_HOSTNAME} {
    basicauth {
        admin JDJhJDE0JEVCNmdaNEg2Ti5Q...
    }
    reverse_proxy n8n:5678
}
```

### Compression

Enable compression:

```caddyfile
{$WEBUI_HOSTNAME} {
    encode gzip zstd
    reverse_proxy openwebui:8080
}
```

## Health Checks

Check proxy services health:

```bash
# Via bootstrap script
bash scripts/bootstrap/health_check.sh

# Direct checks
curl http://localhost:80/  # Caddy
curl http://localhost:443/  # Caddy HTTPS
```

## Troubleshooting

### SSL Certificate Issues

1. **Certificate not generating:**
   - Verify email is set: `LETSENCRYPT_EMAIL`
   - Check domain DNS configuration
   - Ensure port 80/443 are accessible

2. **Certificate renewal:**
   - Caddy auto-renews certificates
   - Check logs: `docker logs seiling-caddy`

### Routing Issues

1. **Service not accessible:**
   - Verify service is running
   - Check Caddyfile configuration
   - Verify hostname/port settings

2. **404 errors:**
   - Check service container names
   - Verify network connectivity
   - Check service health

### Cloudflared Issues

1. **Tunnel not connecting:**
   - Verify tunnel token is correct
   - Check Cloudflare dashboard
   - Review logs: `docker logs seiling-cloudflared`

2. **Service not accessible via tunnel:**
   - Verify tunnel routing in Cloudflare dashboard
   - Check service is running
   - Verify network configuration

## Security

### Caddy
- **Automatic HTTPS**: All connections encrypted
- **Security Headers**: Built-in security headers
- **No Exposed Ports**: Services remain internal
- **Rate Limiting**: Protect against abuse

### Cloudflared
- **Zero-Trust**: No direct port exposure
- **Cloudflare Network**: Global DDoS protection
- **Authentication**: Optional access policies
- **Encryption**: End-to-end encryption

## Performance

- **Latency**: Minimal overhead (<10ms)
- **Throughput**: High throughput support
- **SSL**: Hardware-accelerated SSL termination
- **Caching**: Optional caching support

## Comparison: Caddy vs Traefik

| Feature | Caddy | Traefik |
|---------|-------|---------|
| HTTPS Setup | Automatic | Manual configuration |
| Configuration | Caddyfile (simple) | YAML/TOML (complex) |
| Performance | High | High |
| Features | Modern, focused | Extensive |
| Learning Curve | Easy | Moderate |

Choose Caddy for simplicity, Traefik for advanced features.

## Resources

- [Caddy Documentation](https://caddyserver.com/docs/)
- [Caddyfile Syntax](https://caddyserver.com/docs/caddyfile)
- [Cloudflared Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflare Zero Trust](https://www.cloudflare.com/products/zero-trust/)

## Next Steps

1. Enable Caddy or Cloudflared in `.env`
2. Configure hostnames/domains
3. Deploy services
4. Test service access
5. Configure SSL certificates (for domains)
6. Set up security headers and rate limiting
