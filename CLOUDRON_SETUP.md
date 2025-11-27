# IT Service Portal - Cloudron Installation Guide

## Overview
This guide explains how to install and run IT Service Portal on Cloudron.

---

## Step 1: Prerequisites
Before installing on Cloudron, ensure you have:
- ✅ Active Cloudron instance
- ✅ GitHub account with repository access
- ✅ GitHub Personal Access Token (for Cloudron to access the repo)
- ✅ Domain name configured on Cloudron
- ✅ SMTP credentials (Gmail App Password recommended)

---

## Step 2: Prepare GitHub Access

### Create GitHub Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:user`
4. Generate and **copy the token** (save it safely)

---

## Step 3: Install on Cloudron

### Option A: From GitHub (Recommended)

1. **Go to Cloudron Dashboard**
   - Click: **Apps** → **Install Custom App**

2. **Select Installation Method**
   - Choose: **GitHub Repository**
   - Enter Repository URL:
     ```
     https://github.com/Riydx0/portal-RH2
     ```

3. **Authenticate with GitHub**
   - Paste your Personal Access Token
   - Click: **Authenticate**

4. **Configure Installation**
   - **Subdomain:** Choose a name (e.g., `portal`)
   - **Domain:** Select your Cloudron domain
   - **Manifest:** Will use `cloudron.json` automatically

5. **Set Environment Variables**
   - Click: **Configure Environment**
   - Fill in required variables (see Step 4 below)

6. **Install**
   - Click: **Install** and wait for completion (5-10 minutes)

### Option B: Manual Upload

1. **Download Repository**
   ```bash
   git clone https://github.com/Riydx0/portal-RH2.git
   cd portal-RH2
   ```

2. **Upload to Cloudron**
   - Go to Cloudron Dashboard
   - Click: **Apps** → **Install Custom App**
   - Select: **Upload Directory**
   - Upload the entire folder

3. **Configure and Install** (same as Option A steps 4-6)

---

## Step 4: Configure Environment Variables

### Required Variables

On Cloudron dashboard, under **App Settings** → **Environment Variables**, set:

#### Database (Auto-configured by Cloudron)
```
DATABASE_URL=postgresql://...  (auto-set)
PGHOST=...                      (auto-set)
PGPORT=...                      (auto-set)
PGUSER=...                      (auto-set)
PGPASSWORD=...                  (auto-set)
PGDATABASE=...                  (auto-set)
```

#### Application
```
NODE_ENV=production
SESSION_SECRET=generate-a-random-string-64-characters-long
VITE_APP_NAME=IT Service Portal
VITE_APP_URL=https://portal.yourdomain.com
```

#### Email (SMTP Configuration)

**Using Gmail:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password  (NOT your main password!)
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false
```

**Using Office 365:**
```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@company.com
SMTP_SECURE=false
```

**Using Custom SMTP:**
```
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587 (or 465 for SSL)
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false (or true for port 465)
```

---

## Step 5: Database Setup

After installation completes:

1. **SSH into Cloudron** (or use Cloudron web terminal)

2. **Run Database Migrations**
   ```bash
   npm run db:push
   ```

3. **Create Admin User** (Optional)
   ```bash
   npm run create-admin
   ```

4. **Verify Database**
   - Connect to PostgreSQL via Cloudron DB tools
   - Verify tables exist in the database

---

## Step 6: Post-Installation

### Access Your Application
```
https://portal.yourdomain.com
```

### Default Login Credentials
```
Email: admin@portal
Password: admin
Username: Admin
```

⚠️ **CHANGE THESE CREDENTIALS IMMEDIATELY IN PRODUCTION!**

### Test Email Functionality
1. Go to **Admin Panel** → **Settings**
2. Click: **Test Email**
3. Verify you receive a test email

### Verify Health Check
```bash
curl https://portal.yourdomain.com/api/health
```

Response should be:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## Step 7: Enable Auto-Updates from GitHub

1. **Go to App Settings** in Cloudron Dashboard
2. Click: **Integrations**
3. Select: **GitHub**
4. Enable: **Auto-deploy on push to main branch**
5. Configure webhook URL (provided by Cloudron)

Now, every time you push to GitHub `main` branch, Cloudron will automatically:
- ✅ Pull the latest code
- ✅ Install dependencies
- ✅ Build the application
- ✅ Restart the service

---

## Step 8: Development Workflow

### To Update the Application on Cloudron:

**From your local machine:**

1. **Make changes to the code**
   ```bash
   # Edit files...
   ```

2. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   git push origin main
   ```

3. **Cloudron automatically deploys** (5-10 minutes)
   - Monitor in Cloudron Dashboard under **App Logs**

4. **Verify the deployment**
   - Visit: https://portal.yourdomain.com
   - Check the version number

---

## Troubleshooting

### Application won't start
1. Check logs: Cloudron Dashboard → **Logs**
2. Verify environment variables are set
3. Ensure database is accessible
4. Restart the app: Dashboard → **Restart**

### Database connection errors
1. Verify `DATABASE_URL` is correct
2. Check PostgreSQL addon is running
3. Restart database from Cloudron
4. Run migrations again: `npm run db:push`

### Email not sending
1. Verify SMTP credentials
2. Check `SESSION_SECRET` length (minimum 32 chars)
3. Test with `npm run test:email` (if available)
4. Check spam folder
5. Verify `SMTP_FROM` matches your email

### GitHub sync not working
1. Verify Personal Access Token is valid
2. Check webhook URL in GitHub settings
3. Ensure `main` branch is up to date
4. Manually trigger sync in Cloudron Dashboard

### Large file upload errors
- Maximum file size: 100 MB
- Check disk space: Cloudron Dashboard → **Storage**
- Use `/uploads` directory for file storage

---

## Backup & Restore

### Backup Database
```bash
# Via Cloudron web interface:
Dashboard → App Settings → Backups → Create Backup
```

### Restore from Backup
```bash
# Via Cloudron web interface:
Dashboard → App Settings → Backups → Restore
```

---

## SSL Certificate

Cloudron handles SSL automatically using Let's Encrypt:
- ✅ HTTPS enabled by default
- ✅ Auto-renewal 30 days before expiration
- ✅ Wildcard certificates available

No manual SSL configuration needed!

---

## Security Best Practices

1. **Change admin credentials** immediately
2. **Use strong SESSION_SECRET** (64+ random characters)
3. **Enable HTTPS** (auto on Cloudron)
4. **Rotate SMTP passwords** monthly
5. **Keep dependencies updated** via GitHub commits
6. **Monitor logs** for suspicious activity
7. **Regular backups** (automated in Cloudron)
8. **Restrict IP access** if needed

---

## Performance Tips

- Cloudron handles scaling automatically
- Monitor resource usage: Dashboard → **System**
- Use CDN for static assets if needed
- Enable database connection pooling
- Monitor application logs for bottlenecks

---

## Support & Troubleshooting

For issues:
1. Check Cloudron logs: Dashboard → **Logs**
2. Check GitHub issues: https://github.com/Riydx0/portal-RH2/issues
3. Consult Cloudron documentation: https://docs.cloudron.io
4. Contact Cloudron support if infrastructure issue

---

## Useful Cloudron Commands

```bash
# Via Cloudron terminal/SSH:

# View logs
tail -f /var/log/cloudron/apps/portal.log

# Restart application
systemctl restart cloudron-portal

# Database backup
pg_dump postgresql://... > backup.sql

# Check disk usage
du -sh /var/lib/cloudron/apps/portal
```

---

## Version Information

- **Platform:** Cloudron v7.4.0+
- **Node.js:** 18+
- **PostgreSQL:** 13+
- **Portal Version:** v0.1.0

---

**Last Updated:** November 27, 2025
