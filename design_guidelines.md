# IT Service Portal - Design Guidelines

## Design Approach
**Design System**: Carbon Design System (IBM) + Material Design components, optimized for dark-theme enterprise dashboards with data-intensive interfaces.

**Core Principle**: Functional clarity over decorative elements. Every pixel serves the user's workflow efficiency.

---

## Color Strategy
Dark theme implementation (colors will be specified later):
- **Semantic hierarchy**: 3-level surface elevation system (base, elevated, highest)
- **Status colors**: Success, warning, error, info states for tickets and license statuses
- **Interactive states**: Clear hover, active, disabled, and focus states across all components

---

## Typography

**Font Stack**: 
- Primary: Inter or IBM Plex Sans (via Google Fonts CDN)
- Mono: IBM Plex Mono for license keys and technical data

**Hierarchy**:
- Page Titles: text-3xl font-semibold
- Section Headers: text-xl font-semibold  
- Card Titles: text-lg font-medium
- Body: text-base font-normal
- Captions/Labels: text-sm font-medium
- Metadata: text-xs text-muted

---

## Layout System

**Spacing Units**: Tailwind units of **2, 4, 6, 8, 12, 16** (p-2, m-4, gap-6, space-y-8, py-12, mt-16)

**Dashboard Structure**:
- **Sidebar**: Fixed width 256px (w-64), full height, elevated surface
- **Main Content**: Fluid width with max-w-7xl container, padding px-6 lg:px-8
- **Page Padding**: pt-6 pb-12 for main content area
- **Card Spacing**: gap-6 between cards, p-6 internal padding

**Responsive Breakpoints**:
- Mobile: Collapsible sidebar with overlay
- Tablet (md:): 2-column stat cards
- Desktop (lg:): Full sidebar + multi-column layouts

---

## Component Library

### Navigation
**Sidebar Navigation**:
- Logo/branding at top (h-16)
- Vertical nav items with icons (Heroicons) + labels
- Active state: highlighted background + border-l-4 accent
- User profile section at bottom with role badge
- Collapsible on mobile with hamburger menu

**Top Bar** (optional secondary nav):
- Breadcrumbs on left
- Search bar (if needed)
- Notifications + user dropdown on right

### Dashboard Cards
**Stat Cards** (4-column grid on desktop):
- Large number (text-4xl font-bold)
- Label below (text-sm)
- Icon in top-right corner
- Subtle background with border
- Padding: p-6
- Trend indicator (optional: small arrow + percentage)

**Chart/Widget Cards**:
- Header with title + action button
- Divider line
- Content area with appropriate padding
- Footer for metadata if needed

### Data Tables
**Design Pattern** (Material Design inspired):
- Sticky header row
- Alternating row backgrounds for readability
- Row hover state
- Action buttons (Edit/Delete) aligned right
- Checkbox column for bulk actions
- Pagination at bottom-right
- Search/filter bar above table
- Column sorting indicators
- Empty state with icon + helpful text

**Cell Spacing**: px-4 py-3

### Forms
**Input Fields**:
- Label above input (text-sm font-medium mb-2)
- Input height: h-10 or h-12
- Border with focus ring
- Helper text below in text-xs
- Error states with red border + error message

**Select Dropdowns**: Match input styling with chevron icon

**Buttons**:
- Primary: Solid background, font-medium, px-6 py-2.5
- Secondary: Bordered, transparent background
- Danger: For delete actions
- Icon buttons: Square aspect ratio, p-2
- Size variants: sm (px-3 py-1.5), md (px-6 py-2.5), lg (px-8 py-3)

### Modal/Dialog
- Overlay with backdrop blur
- Centered modal with max-w-2xl
- Header with title + close button
- Body with p-6
- Footer with action buttons (right-aligned)

### Status Badges
- Small pill-shaped badges (px-3 py-1 rounded-full text-xs font-medium)
- Color-coded by status:
  - Open tickets: Blue
  - In-progress: Yellow
  - Closed: Green
  - Available license: Green
  - In-use: Blue  
  - Expired: Red

### Lists & Cards
**Software/License Cards**:
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Card structure: border, rounded-lg, p-6
- Icon/logo at top
- Title (text-lg font-semibold)
- Description/details (text-sm)
- Footer with action buttons or metadata

**Ticket Cards**:
- Compact list view with priority indicator on left
- Title + status badge
- Metadata row (creator, date, assigned to)
- Click to expand or navigate to detail view

### Comments/Activity Feed
- Avatar on left (h-10 w-10 rounded-full)
- Content area on right with author name, timestamp, comment text
- Divider between comments
- Reply/edit actions on hover

---

## Page-Specific Layouts

**Login Page**: 
- Centered card (max-w-md) on empty background
- Logo at top
- Form fields vertically stacked (space-y-4)
- Submit button full-width

**Dashboard Home**:
- Stat cards row at top (4 columns)
- Below: 2-column layout with recent tickets (left) + recent activity (right)

**Software Management**:
- Search + filter bar + "Add Software" button at top
- Data table below with all software entries
- Category tabs or dropdown filter

**Ticket Detail**:
- 2-column layout: 
  - Left (2/3 width): Ticket details card + comments feed
  - Right (1/3 width): Metadata sidebar (status, priority, assignment, timestamps)

**Downloads Page** (for non-admin users):
- Category filter sidebar (w-64) or tabs
- Grid of software cards with download buttons
- Search bar at top

---

## Icons
**Library**: Heroicons (via CDN) - outlined style for navigation, solid for statuses

**Common Icons**:
- Dashboard: ChartBarIcon
- Software: ComputerDesktopIcon  
- Categories: FolderIcon
- Licenses: KeyIcon
- Tickets: TicketIcon
- Users: UsersIcon
- Settings: CogIcon
- Download: ArrowDownTrayIcon
- Edit: PencilIcon
- Delete: TrashIcon

---

## Animations
**Minimal & Purposeful**:
- Sidebar collapse/expand: transition-all duration-300
- Modal fade-in: fade + scale (150ms)
- Hover states: subtle scale or shadow lift
- Loading states: Spinner or skeleton screens
- NO scroll-triggered animations
- NO decorative animations

---

## Images
**No hero images** - This is a functional dashboard.

**Icon/Logo usage**:
- Company logo in sidebar header
- Software icons/logos in software cards (use placeholder if not available)
- User avatars in comments/activity feeds (use initials fallback)

---

**Critical Implementation Notes**:
- Every table MUST have search, filter, and sort capabilities
- All forms MUST have proper validation feedback
- Maintain consistent card elevation throughout
- Use loading states for async operations
- Include empty states with helpful CTAs
- Accessibility: Proper focus management, ARIA labels on icon buttons