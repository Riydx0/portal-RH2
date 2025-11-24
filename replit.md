# IT Service Portal

## Overview

This is a comprehensive IT Service Management Portal with SaaS capabilities, designed for managing software downloads, licenses, support tickets, IT infrastructure, and subscription billing. The application provides a professional dashboard with role-based access control (Admin, Client) and follows a dark-theme enterprise design system inspired by Carbon Design System and Material Design principles.

The portal enables organizations to:
- Centralize software distribution and management with pricing tiers
- Offer SaaS subscription plans (Basic, Standard, Professional)
- Track and manage software licenses
- Handle IT support tickets with assignment and commenting
- Manage user access with role-based permissions
- Track invoices and billing
- Manage IT infrastructure (Networks, VPN, Firewall)
- Support bilingual interface (English/Arabic with RTL support)

## User Preferences

Preferred communication style: Simple, everyday language (Arabic preference)
User wants SaaS model: Software as a Service with subscription tiers

## Recent Changes (November 24, 2025)

### SaaS Subscription System Implementation
- Added subscription plans (Basic: $29, Standard: $79, Professional: $199/month)
- Subscription features: max users, max software items, max storage
- User subscription management endpoints
- Public pricing page at `/pricing` (accessible without login)

### Finance Module
- Invoices table for billing records
- Software pricing table for per-item pricing
- Invoices page for admin to view all invoices
- Software Pricing page for admin to manage pricing

### Database Schema Additions
- `subscription_plans` table: Store pricing tiers
- `subscriptions` table: Track user subscriptions
- `invoices` table: Billing records
- `software_pricing` table: Per-software pricing

### API Endpoints Added
- `GET /api/subscription-plans` - Get active subscription plans
- `GET /api/subscriptions/me` - Get user's current subscription
- `POST /api/subscriptions` - Create/update user subscription
- `POST /api/subscriptions/:id/cancel` - Cancel subscription
- `GET /api/invoices` - Get all invoices (admin)
- `GET /api/invoices/my` - Get user's invoices
- `GET /api/invoices/:id` - Get single invoice
- `GET /api/software-pricing` - Get all active pricing
- `GET /api/software-pricing/software/:softwareId` - Get pricing for specific software

### Frontend Pages Added
- `/pricing` - Public pricing page with feature comparison
- `/invoices` - Admin invoices management
- `/software-pricing` - Admin software pricing management

### UI/Navigation Updates
- Finance section in sidebar (Admin only)
- Invoices and Software Pricing menu items
- All pages support bilingual (English/Arabic)

### Note: Stripe Integration
User dismissed Stripe integration setup. If payment processing is needed later:
- Create Stripe account at stripe.com
- Set up API keys in environment variables
- Implement `/api/checkout` endpoint for Stripe payment
- Use Stripe webhook for subscription updates

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool

**Routing**: Wouter for lightweight client-side routing with protected route implementation

**UI Component Library**: shadcn/ui components built on Radix UI primitives
- Comprehensive component set (40+ components including dialogs, forms, tables, badges, etc.)
- Full dark/light theme support with CSS variables
- Accessible by design (ARIA compliant through Radix UI)

**Styling Strategy**:
- TailwindCSS with custom design tokens
- Dark theme optimized for enterprise dashboards
- Custom elevation system with hover/active states
- Typography: IBM Plex Sans (primary), IBM Plex Mono (monospace for technical data)
- Spacing based on Tailwind's 2/4/6/8/12/16 unit system

**State Management**:
- TanStack Query (React Query) for server state management and caching
- Context API for authentication state
- Form state handled via react-hook-form with Zod validation

**Layout System**:
- Sidebar navigation (16rem fixed width, collapsible on mobile)
- Responsive breakpoints: mobile (default), tablet (md:), desktop (lg:)
- Maximum content width: 7xl container with responsive padding
- Organized sidebar sections: Main Menu, Resource Management, Infrastructure, Team Management, Finance, Account, System Settings

### Backend Architecture

**Runtime & Framework**: Node.js with Express.js

**Language**: TypeScript with ES modules

**API Design**: RESTful API under `/api/*` namespace
- Authentication endpoints (`/api/login`, `/api/register`, `/api/logout`)
- Resource endpoints for categories, software, licenses, tickets, users
- Subscription endpoints for SaaS management
- Invoice and pricing endpoints
- Infrastructure endpoints (networks, VPN, firewall)
- Stats endpoint for dashboard metrics
- Recent tickets endpoint for dashboard overview
- File upload endpoint (`POST /api/upload`) with security validation
- File download endpoint (`GET /api/download/:filename`) with path traversal protection
- Settings endpoints (`GET /api/settings`, `GET /api/settings/:key`, `PATCH /api/settings/:key`) - admin-only

**Authentication & Authorization**:
- Passport.js with multiple strategies:
  - Local Strategy for email/password authentication
  - OpenID Connect Strategy for external OAuth providers (Cloudron, etc.)
- Password hashing using Node.js crypto (scrypt with salt)
- Express sessions with PostgreSQL session store (connect-pg-simple)
- Role-based access control (RBAC) with two roles: admin, client
- Middleware guards: `requireAuth` and `requireAdmin`
- Session configuration:
  - 7-day expiration
  - HTTP-only cookies with sameSite: 'lax'
  - Stored in PostgreSQL

**Development vs Production**:
- Development: Vite middleware integration for HMR
- Production: Pre-built static assets served from `dist/public`
- Separate entry points (`index-dev.ts`, `index-prod.ts`)

### Database Architecture

**ORM**: Drizzle ORM with Drizzle-Zod for schema validation

**Schema Design**:

1. **Users Table**
   - Fields: id, name, email, password (hashed), role (enum), timestamps
   - Role types: admin, client
   - Email unique constraint

2. **Subscription Plans Table** (NEW)
   - Fields: id, name, plan (enum), price, maxUsers, maxSoftware, maxStorage
   - Features stored as text array
   - Stripe price ID for payment integration
   - Status: active/inactive

3. **Subscriptions Table** (NEW)
   - Fields: id, userId (FK), planId (FK), status, stripeSubscriptionId
   - Tracks current subscription per user
   - Period dates and cancellation date

4. **Invoices Table** (NEW)
   - Fields: id, invoiceNumber, clientId (FK), amount, currency, status
   - Status enum: draft, sent, paid, overdue, cancelled
   - Due date and paid date tracking

5. **Software Pricing Table** (NEW)
   - Fields: id, softwareId (FK), price, currency, licenseType
   - Per-software pricing support
   - Active/inactive status

6. **Categories Table**
   - Fields: id, name (unique), description, createdAt
   - Soft-delete pattern via software relationships

7. **Software Table**
   - Fields: id, name, categoryId (FK), description, downloadUrl, filePath, fileSize, version, platform, isActive, timestamps
   - Platform enum: Windows, Mac, Both
   - File upload support: filePath stores uploaded filename, fileSize stores file size in bytes
   - Cascade delete on category removal

8. **Licenses Table**
   - Fields: id, softwareId (FK), licenseKey, assignedTo, notes, status, timestamps
   - Status enum: available, in-use, expired
   - Cascade delete on software removal

9. **Tickets Table**
   - Fields: id, title, description, status, priority, createdBy (FK), assignedTo (FK), timestamps
   - Status enum: open, in-progress, closed
   - Priority enum: low, normal, high
   - Relations to users for creator and assignee

10. **Ticket Comments Table**
    - Fields: id, ticketId (FK), userId (FK), content, timestamps
    - Cascade delete on ticket removal

11. **Settings Table**
    - Fields: key (primary), value, createdAt, updatedAt
    - Key-value store for application configuration
    - Admin-only access for all CRUD operations

12. **Networks Table**
    - Fields: id, name (unique), description, ipRange, gateway, dns, status, timestamps
    - Network infrastructure management

13. **VPN Configs Table**
    - Fields: id, name (unique), description, protocol, serverAddress, port, credentials, timestamps
    - VPN configuration storage

14. **Firewall Rules Table**
    - Fields: id, name, description, action, source/destination IPs, port, protocol, priority, isEnabled, timestamps
    - Firewall rule management

**Database Relationships**:
- One-to-many: Categories → Software, Software → Licenses, Tickets → Comments, Users → Tickets (as creator/assignee)
- One-to-many: SubscriptionPlans → Subscriptions, Users → Subscriptions, Users → Invoices
- Enforced through foreign keys with cascade delete where appropriate

**Migration Strategy**:
- Schema defined in `shared/schema.ts`
- Drizzle Kit for migrations (output to `./migrations`)
- `db:push` script for schema synchronization

### External Dependencies

**Database Service**: 
- Neon Postgres (serverless PostgreSQL via `@neondatabase/serverless`)
- WebSocket support for real-time connections
- Connection pooling enabled
- Environment variable: `DATABASE_URL`

**Session Store**:
- PostgreSQL-backed sessions via `connect-pg-simple`
- Session secret via `SESSION_SECRET` environment variable
- 7-day session expiration (configurable)
- HTTP-only cookies with sameSite: 'lax'

**Third-party UI Libraries**:
- Radix UI primitives (20+ primitive components for accessibility)
- Lucide React for iconography
- date-fns for date formatting
- embla-carousel-react for carousel functionality
- cmdk for command palette components
- class-variance-authority and clsx for conditional styling

**Development Tools**:
- Vite plugins: runtime-error-modal, cartographer (Replit-specific), dev-banner
- tsx for TypeScript execution in development
- esbuild for production builds

**Font Delivery**: Google Fonts CDN for IBM Plex Sans and IBM Plex Mono

**Authentication Requirements**:
- Local authentication support
- OpenID Connect for Cloudron/external providers
- Sessions stored in database (not in-memory)
- CSRF protection via sameSite cookie policy

**Deployment Considerations**:
- Designed for deployment on Cloudron or similar platforms
- Trust proxy enabled for reverse proxy scenarios
- Static assets served from Express in production
- Environment variables required: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV`
