# Deployment Guide

> **Deploy Seiling Buidlbox Locally or in the Cloud**

## Overview

Seiling Buidlbox can be deployed locally for development or in the cloud for production. The same bootstrap script works for both.

## Local Deployment

### Quick Local Setup
```bash
git clone https://github.com/nicoware-dev/seiling-buidlbox.git
cd seiling-buidlbox
./bootstrap.sh
# Select "local-dev" profile
```

### Local Profiles
- **local-dev**: Default, lightweight, no domain needed
- **full-local**: Includes Ollama for local LLM, needs 8GB+ RAM

### Local Requirements
- Docker & Docker Compose
- 4GB+ RAM (8GB+ for full-local)
- 10GB+ storage
- No domain required

## Cloud Deployment

### Cloud Providers
Works on any cloud provider with Docker support:
- **AWS EC2**
- **Google Cloud Compute**
- **Azure VMs**
- **DigitalOcean Droplets**
- **Hetzner Cloud**
- **Linode**

### Cloud Setup Steps
1. **Create VM** (4GB+ RAM, 20GB+ storage)
2. **Install Docker**:
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```
3. **Deploy Seiling Buidlbox**:
   ```bash
   git clone https://github.com/nicoware-dev/seiling-buidlbox.git
   cd seiling-buidlbox
   ./bootstrap.sh
   # Select "remote" profile
   ```

### Domain Setup (Production)
1. **Point domain to server IP**:
   ```
   A record: *.your-domain.com → SERVER_IP
   ```
2. **Configure in bootstrap**:
   ```bash
   Base domain: your-domain.com
   Email: admin@your-domain.com
   ```
3. **Automatic SSL** via Let's Encrypt

## Production Setup

### Security Checklist
- [ ] Use strong passwords (not defaults)
- [ ] Enable firewall (ports 80, 443, 22 only)
- [ ] Regular backups
- [ ] Monitor logs
- [ ] Update regularly

### Firewall Setup
```bash
# Ubuntu/Debian
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Backup Strategy
```bash
# Backup data volumes
docker run --rm -v seiling_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_backup.tar.gz /data

# Backup configuration
cp .env .env.backup
```

### Monitoring
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs --tail=100

# Monitor resources
docker stats
```

## Common Issues

### Domain Not Working
1. Check DNS propagation: `nslookup your-domain.com`
2. Verify A record points to correct IP
3. Wait up to 24 hours for full propagation

### SSL Certificate Errors
1. Check Traefik logs: `docker logs seiling-traefik`
2. Verify domain is accessible from internet
3. Ensure ports 80/443 are open

### Out of Memory
1. Check available memory: `free -h`
2. Disable Ollama: `ENABLE_OLLAMA=no` in .env
3. Consider upgrading server specs

### Port Conflicts
```bash
# Check what's using ports
sudo netstat -tulpn | grep :3000

# Kill conflicting process
sudo kill -9 <PID>
```

### Service Won't Start
```bash
# Check logs
docker logs seiling-<service-name>

# Check .env configuration
cat .env

# Restart service
docker restart seiling-<service-name>
```

### Quick Recovery
```bash
# Complete restart
docker-compose down
docker-compose up -d

# Reset everything (DANGER: loses data)
docker-compose down -v
./bootstrap.sh
``` 