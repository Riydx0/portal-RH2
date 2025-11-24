# IT Service Portal

## Overview

This is a full-stack IT Service Management Portal designed for managing software downloads, licenses, support tickets, and IT resources. The application provides a professional dashboard with role-based access control (Admin, Tech, Client) and follows a dark-theme enterprise design system inspired by Carbon Design System and Material Design principles.

The portal enables organizations to:
- Centralize software distribution and management
- Track and manage software licenses
- Handle IT support tickets with assignment and commenting
- Manage user access with role-based permissions

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 24, 2025)

### Role System Simplification
- Simplified from (Admin, Tech, Client) to (Admin, Client)
- Admin: Full platform control and management
- Client: Can create and view support tickets only

### OpenID Connect (OIDC) Authentication
- Added OpenID Connect support for external authentication providers (Cloudron, etc.)
- Environment variables required:
  - `OPENID_ISSUER_URL`: OpenID provider issuer URL
  - `OPENID_CLIENT_ID`: OAuth client ID  
  - `OPENID_CLIENT_SECRET`: OAuth client secret
  - `OPENID_CALLBACK_URL`: Optional, defaults to `/api/auth/openid/callback`
  - `VITE_OPENID_ISSUER_URL`: Frontend env var to show OpenID login button
- New authentication routes:
  - `GET /api/auth/openid`: Initiate OpenID Connect flow
  - `GET /api/auth/openid/callback`: OAuth callback endpoint
- Users created via OpenID are automatically assigned "client" role

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

### Backend Architecture

**Runtime & Framework**: Node.js with Express.js

**Language**: TypeScript with ES modules

**API Design**: RESTful API under `/api/*` namespace
- Authentication endpoints (`/api/login`, `/api/register`, `/api/logout`)
- Resource endpoints for categories, software, licenses, tickets, users
- Stats endpoint for dashboard metrics
- Recent tickets endpoint for dashboard overview
- File upload endpoint (`POST /api/upload`) with security validation
- File download endpoint (`GET /api/download/:filename`) with path traversal protection
- Settings endpoints (`GET /api/settings`, `GET /api/settings/:key`, `PATCH /api/settings/:key`) - admin-only

**Authentication & Authorization**:
- Passport.js with multiple strategies:
  - Local Strategy for email/password authentication
  - OpenID Connect Strategy for external OAuth providers
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
   - Role types: admin, tech, client
   - Email unique constraint

2. **Categories Table**
   - Fields: id, name (unique), description, createdAt
   - Soft-delete pattern via software relationships

3. **Software Table**
   - Fields: id, name, categoryId (FK), description, downloadUrl, filePath, fileSize, version, platform, isActive, timestamps
   - Platform enum: Windows, Mac, Both
   - File upload support: filePath stores uploaded filename, fileSize stores file size in bytes
   - Cascade delete on category removal

4. **Licenses Table**
   - Fields: id, softwareId (FK), licenseKey, assignedTo, notes, status, timestamps
   - Status enum: available, in-use, expired
   - Cascade delete on software removal

5. **Tickets Table**
   - Fields: id, title, description, status, priority, createdBy (FK), assignedTo (FK), timestamps
   - Status enum: open, in-progress, closed
   - Priority enum: low, normal, high
   - Relations to users for creator and assignee

6. **Ticket Comments Table**
   - Fields: id, ticketId (FK), userId (FK), content, timestamps
   - Cascade delete on ticket removal

7. **Settings Table**
   - Fields: key (primary), value, createdAt, updatedAt
   - Key-value store for application configuration
   - Admin-only access for all CRUD operations

**Database Relationships**:
- One-to-many: Categories → Software, Software → Licenses, Tickets → Comments, Users → Tickets (as creator/assignee)
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
- No external OAuth providers (local authentication only)
- Sessions stored in database (not in-memory)
- CSRF protection via sameSite cookie policy

**Deployment Considerations**:
- Designed for deployment on Cloudron or similar platforms
- Trust proxy enabled for reverse proxy scenarios
- Static assets served from Express in production
- Environment variables required: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV`