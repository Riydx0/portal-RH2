# IT Service Portal v0.1.0

A comprehensive SaaS-enabled IT Service Management platform for managing software distribution, licenses, support tickets, user access, and IT infrastructure.

## 🚀 Features

- ✅ Software Management & Distribution - Manage downloads with tiered pricing
- ✅ License Management - Track and manage software licenses with expiration alerts
- ✅ Support Ticketing System - Create, assign, and resolve technical support tickets
- ✅ SaaS Subscription Plans - Basic, Standard, and Professional tiers with billing
- ✅ User & Group Management - Role-based access control (Admin/Client) with organizational groups
- ✅ Invoice & Financial Management - Automatic invoice generation and billing tracking
- ✅ Email Notifications - Automated email system with attachments using Nodemailer
- ✅ Auto-Update Detection - Automatic change detection with update tracking
- ✅ Bilingual Interface - Full English/Arabic support with RTL/LTR rendering
- ✅ WireGuard VPN - VPN configuration with QR code generation
- ✅ IT Infrastructure Management - Networks, Firewall, and VPN configuration tracking
- ✅ User Authentication - Passport.js with OpenID Connect & local strategies
- ✅ Activity Logging - Comprehensive audit trail of system activities
- ✅ Advanced Dashboard - Analytics and role-based dashboards
- ✅ Password Management - Secure password reset and recovery flows
- ✅ Developer API - RESTful API for integrations

## 📋 Requirements

- Node.js 18 or higher
- PostgreSQL 13 or higher (Neon PostgreSQL supported)
- npm or yarn package manager
- Modern web browser with JavaScript enabled

## 🛠️ Installation & Setup

### ⚡ Quick Start (Recommended)

The easiest way to get started on Linux:

```bash
git clone https://github.com/Riydx0/portal-RH2.git
cd portal-RH2
bash install.sh
npm run dev
```

Done! Open `http://localhost:5000`

For detailed instructions, see: **[LINUX_INSTALL.md](./LINUX_INSTALL.md)**

---

### Manual Installation

#### Step 1: Clone the Repository
```bash
git clone https://github.com/Riydx0/portal-RH2.git
cd portal-RH2
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Configure Environment Variables
Create a `.env` file:
```bash
cp .env.example .env
# Edit .env with your settings
```

Or let `install.sh` create it for you.

#### Step 4: Setup Database
```bash
npm run db:push
```

#### Step 5: Start Development Server
```bash
npm run dev
```

The application will be available at: `http://localhost:5000`

## 🔐 Default Credentials

**Admin Account:**
- Email: admin@portal
- Password: admin
- Username: Admin

**Client Account:**
- Email: client@test.com
- Password: client123

⚠️ **IMPORTANT:** Change these credentials immediately in production!

## 📁 Project Structure

```
├── client/                      # React Frontend
│   ├── src/
│   │   ├── pages/             # Application pages
│   │   ├── components/        # React components
│   │   ├── lib/               # Utility functions
│   │   ├── hooks/             # Custom React hooks
│   │   └── index.css           # Global styles
│   └── index.html
│
├── server/                      # Express Backend
│   ├── routes.ts              # API endpoints
│   ├── storage.ts             # Database layer
│   ├── auth.ts                # Authentication logic
│   ├── email.ts               # Email service
│   ├── wireguard.ts           # WireGuard VPN config
│   ├── app.ts                 # Express app setup
│   └── db.ts                  # Database connection
│
├── shared/                      # Shared Code
│   └── schema.ts              # Drizzle ORM schema
│
├── migrations/                  # Database migrations
├── design_guidelines.md         # UI/UX design system
├── tailwind.config.ts          # Tailwind CSS config
├── vite.config.ts              # Vite build config
├── drizzle.config.ts           # Drizzle ORM config
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript config
```

## 🔄 Git Workflow

### First Time Setup
```bash
git remote add origin https://github.com/Riydx0/portal-RH2.git
git branch -M main
git push -u origin main
```

### Development Workflow

**Start new feature:**
```bash
git pull origin main
git checkout -b feature/your-feature-name
```

**Commit changes:**
```bash
git add .
git commit -m "feat: description of your changes"
git push origin feature/your-feature-name
```

**Merge to main:**
```bash
git checkout main
git pull origin main
git merge feature/your-feature-name
git push origin main
```

**Direct update to main:**
```bash
git add .
git commit -m "update: description"
git push origin main
```

## 🚀 Deployment on Cloudron

### Prerequisites
- Cloudron-compatible Linux server
- GitHub repository access
- GitHub Personal Access Token

### Deployment Steps

1. **Create `cloudron.json`:**
```json
{
  "version": "1.0.0",
  "title": "IT Service Portal",
  "description": "Comprehensive IT Service Management Portal",
  "tagline": "Centralized IT Services Platform",
  "author": "Your Name",
  "website": "https://github.com/Riydx0/portal-RH2",
  "contactEmail": "your-email@example.com",
  "icon": "file://icon.png",
  "postInstallMessage": "Thank you for installing IT Service Portal!"
}
```

2. **Connect GitHub to Cloudron:**
   - Go to Cloudron Dashboard → Apps → Install Custom App
   - Provide GitHub repository URL
   - Authenticate with your GitHub Personal Access Token
   - Configure environment variables

3. **Enable Auto-Deployment:**
   - Push changes to GitHub `main` branch
   - Cloudron will automatically build and deploy

4. **Set Environment Variables on Cloudron:**
   - Navigate to App Settings
   - Configure all `.env` variables
   - Restart the application

## 📊 Database Schema

### Key Tables

**Users**
- id, email, username, password_hash, role (admin/client), created_at

**Subscription Plans**
- id, name, price, features, billing_cycle

**Software**
- id, name, category_id, version, file_path, price

**Licenses**
- id, software_id, user_id, license_key, expiry_date, status

**Support Tickets**
- id, user_id, title, description, status, priority, created_at

**Invoices**
- id, user_id, amount, due_date, status, items

**IT Infrastructure**
- Networks, VPN Configurations, Firewall Rules

## 🔍 Key Features Explained

### SaaS Subscription Model
Users can subscribe to one of three tiers:
- **Basic Plan ($29/month):** Core features
- **Standard Plan ($79/month):** Additional features + priority support
- **Professional Plan ($199/month):** All features + dedicated support

### Role-Based Access Control
- **Admin:** Full access to all system features and settings
- **Client:** Access to personal subscriptions, tickets, and licenses

### WireGuard VPN Integration
- Generate secure VPN configurations
- QR code generation for easy mobile setup
- Track active VPN connections

### Automated Notifications
- Email alerts for ticket updates
- Invoice delivery and reminders
- License expiration warnings
- System event notifications

### Update Detection
- Automatic detection of database changes
- Notification of new software additions
- Tracking of user profile updates
- Audit log of all modifications

## ⚠️ Important Notes

### Files NOT Tracked by Git
These files are in `.gitignore` and won't be pushed:
- `.env` - Environment secrets ❌
- `node_modules/` - Dependencies (reinstalled via npm install)
- `dist/` - Build output (regenerated on build)
- `uploads/` - User uploaded files
- `*.log` - Log files

### Files REQUIRED for Repository
- `package.json` - All dependencies defined here
- `VERSION` - Current version number
- `.gitignore` - Files to exclude from git
- `README.md` - Project documentation
- Database schema in `shared/schema.ts`

### Security Best Practices
1. Never commit `.env` files
2. Use environment variables for all secrets
3. Rotate `SESSION_SECRET` regularly
4. Enable HTTPS in production
5. Keep dependencies up to date: `npm audit fix`
6. Use strong passwords for admin accounts
7. Enable Two-Factor Authentication when available

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Database
npm run db:push         # Sync database schema
npm run db:studio       # Open Drizzle Studio
npm run db:migrate      # Run migrations

# Admin Setup
npm run create-admin    # Create admin user
npm run fix-admin-password  # Reset admin password

# Production
npm run build           # Build production bundle
npm start              # Start production server
```

## 📞 Support & Issues

For bugs, feature requests, or questions:
1. Check existing [GitHub Issues](https://github.com/Riydx0/portal-RH2/issues)
2. Create a new issue with detailed description
3. Include error logs and reproduction steps
4. Contact: support@yourcompany.com

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏢 Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn/UI
- TanStack Query
- Wouter (Routing)

**Backend:**
- Node.js with Express
- TypeScript
- Passport.js (Authentication)
- Drizzle ORM
- PostgreSQL

**Infrastructure:**
- Neon PostgreSQL (Serverless)
- Nodemailer (Email)
- WireGuard VPN

## 📈 Roadmap

- [ ] Advanced reporting and analytics
- [ ] Mobile app (iOS/Android)
- [ ] Integration with external ticketing systems
- [ ] Multi-tenant support
- [ ] Advanced security features (2FA, SSO)
- [ ] Custom branding and white-label options
- [ ] API rate limiting and usage tracking
- [ ] Advanced backup and disaster recovery

## 👨‍💻 Author

**Riydx0** - [GitHub Profile](https://github.com/Riydx0)

---

**Last Updated:** November 27, 2025  
**Current Version:** v0.1.0  
**Status:** Active Development
