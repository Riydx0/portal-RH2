# Cloudron Deployment Guide

## IT Service Portal on Cloudron

This guide explains how to deploy the IT Service Portal on Cloudron.

---

## ✅ Prerequisites

1. **Cloudron Server** - Installed and running on your VPS
2. **GitHub Account** - With the repository cloned
3. **Domain Name** - For your Cloudron instance

---

## 🚀 Step 1: Push to GitHub

### 1.1 First Time Setup (Only Once)

```bash
cd /path/to/your/project
git init
git add .
git commit -m "Initial commit: IT Service Portal v0.1.0"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/portal-RH2.git
git push -u origin main
```

### 1.2 Push Updates

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

---

## 🐳 Step 2: Build Docker Image

The repository includes a `Dockerfile` that Cloudron will use automatically.

### 2.1 Local Testing (Optional)

```bash
# Build the image
docker build -t it-portal:latest .

# Run with PostgreSQL
docker-compose up -d
```

Access at: `http://localhost:5000`

---

## ☁️ Step 3: Deploy on Cloudron

### 3.1 Add Application to Cloudron

1. **Login to Cloudron Dashboard**
   - Navigate to `https://cloudron.subdomain.com/dashboard`
   - Go to: **Apps** → **+** (Install)

2. **Manual GitHub Installation**
   - Click **"From GitHub"** (if available)
   - Select your repository: `https://github.com/YOUR-USERNAME/portal-RH2`
   - Choose branch: `main`
   - Click **Install**

### 3.2 Alternative: Using CLI

```bash
# Install Cloudron CLI
npm install -g @cloudron/cli

# Login to Cloudron
cloudron login

# Deploy from GitHub
cloudron install --image https://github.com/YOUR-USERNAME/portal-RH2 \
  --subdomain portal \
  --title "IT Service Portal"
```

---

## 🔧 Step 4: Configure Environment Variables

In **Cloudron Dashboard** → **Apps** → **IT Service Portal** → **Settings**:

### Essential Variables:

```
NODE_ENV=production

# Database (Cloudron provides automatically)
DATABASE_URL=postgresql://user:password@postgres/portal_db
PGHOST=postgres
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your-strong-password
PGDATABASE=portal_db

# Session Security (generate a strong random string)
SESSION_SECRET=your-very-long-random-secret-key-here-min-32-chars

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@yourcompany.com
SMTP_SECURE=false
```

### How to Generate SESSION_SECRET:

```bash
# On Linux/Mac
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🗄️ Step 5: Database Setup

### 5.1 Initialize Database

Once deployed, run migrations:

```bash
# SSH into the container
cloudron exec portal -- npm run db:push

# Or manually via SSH
ssh cloudron@your-domain.com
cd /app
npm run db:push
```

### 5.2 Default Admin Account

- **Email:** `admin@portal`
- **Password:** `admin`
- **Username:** `Admin`

⚠️ **IMPORTANT:** Change these credentials immediately after first login!

---

## 📁 Step 6: Configure Storage

The application stores uploaded files in `/app/uploads`.

### Backup uploads folder in Cloudron:

```bash
# From your local machine
cloudron exec portal -- tar czf /tmp/uploads.tar.gz uploads/
cloudron download portal /tmp/uploads.tar.gz ./backups/uploads.tar.gz
```

---

## ✉️ Step 7: Email Setup

### Using Gmail:

1. Enable 2-Factor Authentication in Gmail
2. Generate App Password at: https://myaccount.google.com/apppasswords
3. Use the 16-character password in `SMTP_PASSWORD`
4. Set `SMTP_USER` to your Gmail address

### Using Custom SMTP:

- Contact your email provider for SMTP settings
- Update variables in Cloudron Dashboard

---

## 🔐 Step 8: HTTPS & SSL

Cloudron automatically provides HTTPS certificates via Let's Encrypt.

Access your app at: `https://portal.your-domain.com`

---

## 📊 Monitoring

### View Application Logs:

```bash
# Via Cloudron CLI
cloudron logs portal

# Real-time logs
cloudron logs portal -f
```

### Health Check:

The application includes health check endpoint:
- URL: `/api/health`
- Cloudron monitors this automatically every 30 seconds

---

## 🆘 Troubleshooting

### 1. Database Connection Error

```bash
# Verify database variables
cloudron env portal | grep DATABASE

# Test connection
cloudron exec portal -- npm run db:push
```

### 2. Email Not Sending

- Verify SMTP credentials in Dashboard
- Check logs: `cloudron logs portal`
- Test email from Settings → Email Settings

### 3. Upload Permission Issues

```bash
# Fix permissions
cloudron exec portal -- chmod -R 755 uploads/
```

### 4. Out of Memory

- Increase container memory in Cloudron Dashboard
- Restart: `cloudron restart portal`

---

## 🔄 Update to Latest Version

```bash
# Pull latest code
git pull origin main

# Push to GitHub (if not already)
git push origin main

# Rebuild in Cloudron Dashboard
# Or via CLI
cloudron update portal

# Run migrations if needed
cloudron exec portal -- npm run db:push
```

---

## 🛡️ Production Checklist

- [ ] Change admin credentials
- [ ] Configure SMTP for email notifications
- [ ] Set up strong SESSION_SECRET
- [ ] Enable HTTPS (automatic with Cloudron)
- [ ] Configure backup strategy
- [ ] Test email notifications
- [ ] Review user permissions
- [ ] Set up monitoring/alerts

---

## 📞 Support

- **GitHub Issues:** https://github.com/Riydx0/portal-RH2/issues
- **Cloudron Docs:** https://docs.cloudron.io
- **Project Repo:** https://github.com/Riydx0/portal-RH2

---

## 📝 Quick Reference

| Command | Purpose |
|---------|---------|
| `cloudron login` | Login to Cloudron |
| `cloudron install` | Install new app |
| `cloudron restart portal` | Restart application |
| `cloudron logs portal -f` | View live logs |
| `cloudron exec portal -- [cmd]` | Run command in container |
| `cloudron update portal` | Update to latest version |

---

Generated for IT Service Portal v0.1.0
