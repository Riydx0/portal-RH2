# Deployment Checklist - IT Service Portal

Complete this checklist before and after deploying to Cloudron.

---

## Pre-Deployment (Local Testing)

### Code Quality
- [ ] No console.log() statements in production code
- [ ] No TODO/FIXME comments remaining
- [ ] All imports are clean (no unused imports)
- [ ] Environment variables properly documented
- [ ] .env file is in .gitignore
- [ ] No hardcoded secrets or API keys

### Testing
- [ ] Application starts with `npm run dev`
- [ ] No errors in browser console
- [ ] All API endpoints respond correctly
- [ ] Database migrations work: `npm run db:push`
- [ ] Email functionality tested
- [ ] File uploads work (< 100MB)
- [ ] Authentication flows tested

### Documentation
- [ ] README.md is updated
- [ ] CLOUDRON_SETUP.md is complete
- [ ] Environment variables are documented
- [ ] API endpoints are documented

### GitHub
- [ ] All changes committed: `git status` is clean
- [ ] Latest version pushed: `git push origin main`
- [ ] GitHub shows all files properly
- [ ] No large files (>100MB) in repository
- [ ] .gitignore is working correctly

---

## Cloudron Installation

### Pre-Installation
- [ ] GitHub Personal Access Token created
- [ ] SMTP credentials obtained (if using email)
- [ ] Domain configured on Cloudron
- [ ] Sufficient storage available
- [ ] Database addon will be auto-installed

### Installation Process
- [ ] Repository URL correct: `https://github.com/Riydx0/portal-RH2`
- [ ] Subdomain selected (e.g., `portal`)
- [ ] Domain selected from available options
- [ ] cloudron.json found and recognized
- [ ] Installation completed without errors

### Environment Variables Setup
- [ ] NODE_ENV = production
- [ ] SESSION_SECRET = 64+ random characters
- [ ] SMTP_HOST configured (if needed)
- [ ] SMTP_PORT configured (587 or 465)
- [ ] SMTP_USER configured
- [ ] SMTP_PASSWORD configured
- [ ] SMTP_FROM configured
- [ ] SMTP_SECURE set correctly

### Database Setup (Post-Installation)
- [ ] PostgreSQL addon is running
- [ ] DATABASE_URL is set
- [ ] Database migrations successful: `npm run db:push`
- [ ] Tables created in database
- [ ] Admin user created (optional)

---

## Post-Installation Testing

### Application Access
- [ ] Application accessible via HTTPS
- [ ] SSL certificate valid
- [ ] No mixed content warnings
- [ ] Page loads without errors

### Functionality
- [ ] Login page loads
- [ ] Can login with admin credentials
- [ ] Dashboard displays correctly
- [ ] Navigation works properly
- [ ] File uploads work (test with small file)
- [ ] Database queries work

### Email System
- [ ] SMTP connection successful
- [ ] Test email received in inbox
- [ ] Email formatting is correct
- [ ] Attachments work (if applicable)

### Health Checks
- [ ] Health check endpoint responds: `/api/health`
- [ ] Cloudron health check shows green
- [ ] No errors in application logs
- [ ] Database connection pool healthy

### Monitoring
- [ ] CPU usage normal (< 30%)
- [ ] Memory usage normal (< 50%)
- [ ] Disk usage monitored
- [ ] Logs accessible and clean

---

## Security Verification

### Before Going Live
- [ ] Admin password changed from default
- [ ] SESSION_SECRET is strong (64+ chars)
- [ ] HTTPS enabled and working
- [ ] SSL certificate valid
- [ ] .env file NOT in repository
- [ ] Secrets stored in Cloudron environment
- [ ] Database accessible only internally
- [ ] Backups configured

### Access Control
- [ ] User registration works correctly
- [ ] Role-based access working (Admin vs Client)
- [ ] Unauthorized access properly blocked
- [ ] Session timeout configured

---

## Performance Testing

- [ ] Page load time < 2 seconds
- [ ] API responses < 500ms
- [ ] Database queries optimized
- [ ] No memory leaks in logs
- [ ] Asset caching working

---

## Backup Strategy

- [ ] Database backups configured
- [ ] First backup completed successfully
- [ ] Backup retention policy set
- [ ] Restore procedure tested
- [ ] Backups stored securely

---

## Documentation & Handoff

- [ ] Team trained on application usage
- [ ] Admin procedures documented
- [ ] Support contacts listed
- [ ] Emergency procedures documented
- [ ] Runbook created

---

## Post-Deployment (Ongoing)

### Weekly
- [ ] Check application logs for errors
- [ ] Verify backup completion
- [ ] Test email notifications
- [ ] Monitor system resources

### Monthly
- [ ] Review and update dependencies: `npm outdated`
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Review user access logs
- [ ] Test disaster recovery procedures
- [ ] Update documentation if needed

### Quarterly
- [ ] Performance analysis
- [ ] Security audit
- [ ] Database optimization
- [ ] Capacity planning

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| App won't start | Check logs, verify ENV vars, restart app |
| Database errors | Check connection string, verify PostgreSQL is running |
| Email not sending | Verify SMTP credentials, check logs, test with curl |
| Slow performance | Check resource usage, optimize queries, clear cache |
| SSL certificate | Cloudron auto-renews, verify expiration date |
| GitHub sync failing | Check token, verify webhook, manually trigger |

---

## Sign-Off

- [ ] All checklist items completed
- [ ] Testing verified by team lead
- [ ] Client approval received
- [ ] Documentation complete
- [ ] Go-live approved

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Verified By:** _______________  
**Notes:** _____________________________________________

---

**Status:** ✅ Ready for Production / ⚠️ Review Required
