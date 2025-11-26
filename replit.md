# IT Service Portal

## Overview
The IT Service Portal is a comprehensive SaaS-enabled IT Service Management application. It centralizes software distribution, license management, support ticketing, and IT infrastructure oversight. Key capabilities include managing software downloads with pricing tiers, offering SaaS subscription plans (Basic, Standard, Professional), tracking licenses, handling support tickets, managing user access with role-based permissions, and overseeing invoices and billing. The portal also features IT infrastructure management (Networks, VPN, Firewall) and supports a bilingual interface (English/Arabic with RTL support). The system provides a professional dashboard with role-based access for Admin and Client users, adhering to a dark-theme enterprise design system inspired by Carbon Design System and Material Design.

## User Preferences
Preferred communication style: Simple, everyday language (Arabic preference)
User wants SaaS model: Software as a Service with subscription tiers

## System Architecture

### Frontend Architecture
The frontend is built with React 18 and TypeScript, using Vite as the build tool. Wouter handles client-side routing with protected routes. UI components are provided by shadcn/ui, built on Radix UI primitives, ensuring accessibility and offering dark/light theme support via TailwindCSS with custom design tokens. State management utilizes TanStack Query for server state and caching, Context API for authentication, and react-hook-form with Zod for form handling. The layout features a responsive sidebar navigation and adheres to a maximum content width of 7xl. Pages are structured for both client and admin roles, including dedicated sections for submitting tickets, requesting licenses, software downloads, and various administration tasks.

### Backend Architecture
The backend is powered by Node.js with Express.js, written in TypeScript using ES modules. It provides a RESTful API under the `/api/*` namespace, covering authentication, resource management (categories, software, licenses, tickets, users), subscriptions, invoices, pricing, and IT infrastructure. Authentication and authorization are handled by Passport.js, supporting local and OpenID Connect strategies, with password hashing using scrypt. Express sessions are stored in PostgreSQL (`connect-pg-simple`) with role-based access control (Admin, Client) enforced via middleware. Nodemailer is integrated for email services, supporting configurable SMTP settings and templated notifications for various system events. The architecture is designed to differentiate between development and production environments, with static assets served from Express in production.

### Database Architecture
The database leverages Drizzle ORM with Drizzle-Zod for schema validation. The schema includes tables for Users (with roles: admin, client), Subscription Plans, User Subscriptions, Invoices, Software Pricing, Categories, Software, Licenses, Tickets, Ticket Comments, and system Settings. Additionally, tables for Networks, VPN Configurations, and Firewall Rules manage IT infrastructure. Relationships are defined with foreign keys, including one-to-many associations and cascade delete where appropriate. A migration strategy using Drizzle Kit ensures schema synchronization.

## External Dependencies

- **Database Service**: Neon Postgres (serverless PostgreSQL via `@neondatabase/serverless`)
- **Session Store**: PostgreSQL-backed sessions via `connect-pg-simple`
- **Email Service**: Nodemailer for SMTP email delivery
- **UI Libraries**: Radix UI primitives, Lucide React, date-fns, embla-carousel-react, cmdk, class-variance-authority, clsx
- **Authentication**: Passport.js (Local Strategy, OpenID Connect Strategy)
- **Deployment**: Designed for Cloudron deployment, requiring `DATABASE_URL`, `SESSION_SECRET`, and `NODE_ENV` environment variables.