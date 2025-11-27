# Docker Deployment Guide - IT Service Portal

This guide explains how to deploy IT Service Portal using Docker on Cloudron or any Docker-compatible server.

---

## Prerequisites

- Docker installed (latest version)
- Docker Compose installed
- GitHub repository access
- Domain name (for production)
- SMTP credentials (for email)

---

## Local Testing with Docker

### Step 1: Clone Repository
```bash
git clone https://github.com/Riydx0/portal-RH2.git
cd portal-RH2
```

### Step 2: Create .env File
```bash
cat > .env << EOF
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/portal_db
SESSION_SECRET=your-super-secret-string-here-min-32-chars
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@example.com
SMTP_SECURE=false
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=portal_db
EOF
```

### Step 3: Build Docker Image
```bash
docker build -t portal-rh2:latest .
```

### Step 4: Start Services with Docker Compose
```bash
docker-compose up -d
```

This will start:
- ✅ Application on port 5000
- ✅ PostgreSQL database on port 5432

### Step 5: Initialize Database
```bash
docker-compose exec app npm run db:push
```

### Step 6: Access Application
```
http://localhost:5000
```

**Default Credentials:**
- Email: admin@portal
- Password: admin

### Step 7: Stop Services
```bash
docker-compose down
```

---

## Deploy on Cloudron with Docker

### Step 1: Upload to Cloudron

1. In Cloudron Dashboard: **Apps** → **Install Custom App**
2. Choose: **Docker**
3. Paste Docker image URL:
   ```
   ghcr.io/riydx0/portal-rh2:latest
   ```
   (or your Docker Hub image)

### Step 2: Configure Environment Variables

In Cloudron App Settings, set all variables from `.env`:

```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@postgres:5432/portal_db
SESSION_SECRET=your-64-char-random-string
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false
```

### Step 3: Port Configuration

- **Internal Port:** 5000
- **External Port:** 443 (HTTPS auto-configured)

### Step 4: Database Configuration

Cloudron can provide PostgreSQL addon:
- Enable: **PostgreSQL 13 Add-on**
- Connection string auto-generated in `DATABASE_URL`

### Step 5: Deploy

1. Click: **Install**
2. Wait for image download and container start (3-5 minutes)
3. Run post-install setup

### Step 6: Post-Installation

```bash
# SSH into container or use Cloudron terminal:

# Initialize database
npm run db:push

# Create admin user (optional)
npm run create-admin
```

### Step 7: Access Application

```
https://portal.yourdomain.com
```

---

## Build and Push Custom Docker Image

### To Docker Hub:

```bash
# Build image
docker build -t yourusername/portal-rh2:latest .

# Login to Docker Hub
docker login

# Push image
docker push yourusername/portal-rh2:latest
```

### To GitHub Container Registry:

```bash
# Build image
docker build -t ghcr.io/yourusername/portal-rh2:latest .

# Login to GitHub
docker login ghcr.io

# Push image
docker push ghcr.io/yourusername/portal-rh2:latest
```

---

## Dockerfile Explanation

```dockerfile
FROM node:18-alpine
# Use lightweight Node.js 18 image

WORKDIR /app
# Set working directory

RUN apk add --no-cache python3 make g++
# Install build dependencies for native modules

COPY package*.json ./
# Copy package files

RUN npm ci
# Clean install (for production)

COPY . .
# Copy application code

RUN npm run build
# Build the application (TypeScript → JavaScript)

EXPOSE 5000
# Expose port 5000

CMD ["npm", "start"]
# Start the application
```

---

## Docker Compose Explanation

The `docker-compose.yml` file defines:

### App Service
- Builds from Dockerfile
- Exposes port 5000
- Sets all environment variables
- Includes health check
- Automatically restarts on failure

### PostgreSQL Service
- Uses official PostgreSQL 13 image
- Creates database and user
- Persists data in named volume
- Exposes port 5432

### Volume
- `postgres_data`: Persistent database storage

---

## Health Check

Docker monitors application health:

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z",
  "database": "connected",
  "uptime": 3600
}
```

---

## View Logs

### Using Docker Compose:
```bash
# View all logs
docker-compose logs

# View only app logs
docker-compose logs app

# Follow logs (live)
docker-compose logs -f app
```

### Using Docker:
```bash
docker logs container_id
```

---

## Backup & Restore

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres portal_db > backup.sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U postgres portal_db < backup.sql
```

### Backup Volumes
```bash
docker run --rm -v portal-rh2_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/db_backup.tar.gz -C /data .
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `DATABASE_URL` | DB connection | `postgresql://...` |
| `SESSION_SECRET` | Session key | 64-char random string |
| `SMTP_HOST` | Email server | `smtp.gmail.com` |
| `SMTP_PORT` | Email port | `587` |
| `SMTP_USER` | Email username | `your@gmail.com` |
| `SMTP_PASSWORD` | Email password | `app-password` |
| `SMTP_FROM` | From address | `noreply@domain.com` |
| `SMTP_SECURE` | Use SSL/TLS | `false` (587) or `true` (465) |

---

## Performance Optimization

### Memory Limits
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### CPU Limits
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
        reservations:
          cpus: '0.5'
```

### Database Performance
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d portal_db

# Analyze tables
ANALYZE;

# Vacuum
VACUUM FULL;
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Container exits immediately | Check logs: `docker-compose logs app` |
| Database won't connect | Verify `DATABASE_URL` format and credentials |
| Port already in use | Change port in docker-compose.yml |
| Permission denied | Run with `sudo` or add user to docker group |
| Out of memory | Increase Docker memory limit |
| Slow database | Run `VACUUM` and `ANALYZE` on PostgreSQL |

---

## Scaling with Docker Swarm or Kubernetes

### Docker Swarm Stack
```bash
docker stack deploy -c docker-compose.yml portal
```

### Kubernetes Deployment
1. Export docker-compose to Kubernetes manifests
2. Use Kompose: `kompose convert`
3. Deploy: `kubectl apply -f manifests/`

---

## Security Best Practices

1. ✅ Use `.env.example` (never commit `.env`)
2. ✅ Change default credentials immediately
3. ✅ Use strong `SESSION_SECRET` (64+ chars)
4. ✅ Enable HTTPS in Cloudron
5. ✅ Keep Docker images updated
6. ✅ Use private Docker registry if needed
7. ✅ Restrict network access
8. ✅ Regular backups

---

## Resources

- Docker Documentation: https://docs.docker.com
- Docker Hub: https://hub.docker.com
- GitHub Container Registry: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
- Cloudron Documentation: https://docs.cloudron.io

---

**Last Updated:** November 27, 2025
