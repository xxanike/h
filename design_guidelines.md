# Senpai Network Marketplace - Design Guidelines

## Design Approach: Utility-First Marketplace System

**Selected Approach**: Design System (Material Design principles adapted for marketplace functionality)

**Justification**: This is a transaction-heavy, multi-role platform (buyer/seller/admin) requiring clear information hierarchy, efficient workflows, and trust-building elements. The design prioritizes usability, clear status indicators, and seamless payment verification flows over pure visual appeal.

**Key Principles**:
- Role-based interface clarity (distinct visual treatments for buyer/seller/admin views)
- Trust and transparency (clear payment flows, status indicators, verification badges)
- Efficient admin workflows (quick-scan tables, one-click actions)
- Mobile-first responsive design for Indian market accessibility

---

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary Brand: 245 65% 50% (vibrant purple-blue, trust and technology)
- Primary Hover: 245 65% 45%
- Secondary: 200 75% 45% (bright cyan for actions and highlights)
- Background: 0 0% 98% (soft off-white)
- Surface: 0 0% 100% (pure white for cards)
- Text Primary: 220 15% 15% (deep charcoal)
- Text Secondary: 220 10% 45% (medium gray)
- Border: 220 13% 91% (subtle borders)

**Dark Mode**:
- Primary Brand: 245 70% 60% (brightened for contrast)
- Primary Hover: 245 70% 55%
- Secondary: 200 80% 50%
- Background: 220 15% 10% (deep charcoal)
- Surface: 220 15% 13% (elevated surfaces)
- Text Primary: 0 0% 95% (near white)
- Text Secondary: 220 10% 65%
- Border: 220 15% 20%

**Status Colors** (consistent across modes):
- Success: 142 72% 45% (approved/verified)
- Warning: 38 92% 50% (pending actions)
- Error: 4 90% 58% (rejected/failed)
- Info: 210 100% 56% (neutral information)

**Trust Elements**:
- Verified Badge: 142 72% 45% with checkmark
- Admin Highlight: 280 55% 50% (distinct purple for admin actions)

### B. Typography

**Font Stack**:
- Primary: 'Inter', system-ui, -apple-system, sans-serif (clean, modern, excellent readability)
- Monospace: 'JetBrains Mono', 'Courier New', monospace (for transaction IDs, UTR codes)

**Scale**:
- Hero/Page Title: text-4xl md:text-5xl font-bold (36-48px)
- Section Heading: text-2xl md:text-3xl font-semibold (24-30px)
- Card Title: text-xl font-semibold (20px)
- Body Large: text-lg (18px) - for important CTAs and labels
- Body: text-base (16px) - default body text
- Body Small: text-sm (14px) - meta information, helper text
- Caption: text-xs (12px) - timestamps, secondary info
- Transaction IDs: font-mono text-sm (monospace for easy reading)

**Weights**:
- Bold: 700 (headings, CTAs)
- Semibold: 600 (subheadings, card titles)
- Medium: 500 (emphasized body text)
- Regular: 400 (body text)

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20 for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: py-12 to py-20
- Card gaps: gap-4 to gap-6
- Element margins: m-2, m-4, m-8

**Breakpoints**:
- Mobile: base (default)
- Tablet: md: 768px
- Desktop: lg: 1024px
- Wide: xl: 1280px

**Container Strategy**:
- Max width: max-w-7xl (1280px) for main content
- Gutters: px-4 md:px-6 lg:px-8
- Product grids: 1 column mobile, 2-3 tablet, 3-4 desktop

### D. Component Library

**Navigation**:
- Sticky header with shadow on scroll
- Logo left, nav center, profile/settings right
- Mobile: hamburger menu with slide-out drawer
- Active state: border-b-2 with primary color

**Product Cards**:
- Rounded-lg borders with subtle shadow (shadow-sm hover:shadow-md)
- Thumbnail 16:9 aspect ratio with object-cover
- Price prominent (text-2xl font-bold primary color)
- Tag pills with subtle backgrounds (bg-primary/10 text-primary)
- Status badge top-right (approved/pending/rejected)

**Floating Upload Button**:
- Fixed bottom-right (bottom-6 right-6)
- Large circular button (w-16 h-16)
- Primary gradient with white + icon
- Shadow-lg with pulse animation on hover
- Desktop: expands to show "Upload Product" text on hover
- Mobile: stays circular with just + icon

**Buy Modal**:
- Center screen overlay with backdrop blur
- Two-column layout: QR code left (lg:w-1/2), instructions right
- QR code: border-4 border-primary rounded-xl p-4 white background
- Payment amount: large, bold (text-3xl) in primary color
- Transaction ID input: full-width with monospace font
- "Verify Payment" CTA: full-width gradient button

**Admin Panel Components**:
- Data tables with alternating row backgrounds
- Quick action buttons in each row (Approve/Reject with icon-only on mobile)
- Filter/search bar sticky at top
- Audit log: timeline view with timestamps and user avatars
- File download: icon button with tooltip

**Forms**:
- Labels: text-sm font-medium mb-2
- Inputs: border-2 rounded-lg p-3 focus:border-primary transition
- File upload: dashed border drag-and-drop zone with upload icon
- Textarea: min-h-32 with resize capability
- Validation: red border + error text below for invalid fields

**Status Indicators**:
- Pending: warning color with clock icon
- Approved: success color with checkmark icon  
- Rejected: error color with X icon
- Verified: success color with shield-check icon
- Dot indicators for list views, full badges for detail views

**Seller Dashboard**:
- Stats cards row: Total Products, Pending Approval, Total Earnings (grid-cols-1 md:grid-cols-3)
- Product management table with inline edit/delete actions
- Commission breakdown: visual split showing 70/30 with percentages

### E. Animations

Use sparingly and purposefully:
- Page transitions: fade-in (150ms ease-out)
- Card hover: scale-102 transform with shadow growth (200ms)
- Button interactions: bg color transitions (150ms)
- Modal open/close: fade + scale from center (200ms)
- Loading states: spin animation for icons, pulse for skeletons
- Success actions: subtle scale-up (120%) then scale-down checkmark
- NO scroll-triggered animations or parallax effects

---

## Images

**QR Code Display**:
- Location: Buy modal center-left section
- Treatment: White background, 4px primary border, rounded corners (xl)
- Size: 280x280px on desktop, 240x240px on mobile
- File: `/static/scan here.png` served as static asset
- Context: Accompanied by "Scan to Pay" heading and UPI ID display

**Product Thumbnails**:
- All product cards require thumbnail images
- Aspect ratio: 16:9 or 4:3 (consistent per grid)
- Placeholder: Gradient background with upload icon when no image
- Treatment: object-cover with rounded-t-lg (matches card border radius)

**Profile/Admin Avatars**:
- Google profile pictures for logged-in users
- Size: 40x40px in navbar, 80x80px in profile page
- Fallback: Colored circle with user initials (using primary color variants)

**Hero Section**: NO traditional hero image
- Replace with prominent feature showcase: 3-card grid highlighting "List Products", "Secure Payments", "Admin Verified" with icons and gradients
- Background: Subtle gradient mesh (primary to secondary at 120deg, low opacity 10%)

**Empty States**:
- Illustrative icons (not full images) for:
  - No products listed: shopping bag icon
  - No orders: receipt icon  
  - Pending verification: hourglass icon
- SVG icons from Heroicons, 80x80px in muted gray

---

## Page-Specific Layouts

**Home Page**:
- Minimal header: "Browse Marketplace" with search bar
- Filter chips row (All, Documents, Media, Code, etc.)
- Product grid: gap-6, responsive columns (1/2/3/4)
- Each card: hover lift effect, quick-view on click

**Product Detail**:
- Breadcrumb navigation (Home > Category > Product)
- Two-column: image/preview left (60%), details right (40%)
- Sticky Buy button on scroll
- Seller info card below: avatar, name, rating (if implemented), verified badge

**Profile (Seller View)**:
- Top stats dashboard (3 cards)
- Tab navigation: My Products | Earnings | Payouts
- Products table with status column and actions
- Upload history with approval status timeline

**Admin Panel**:
- Sidebar navigation (desktop), bottom tabs (mobile)
- Sections: Pending Approvals | Payment Verification | Product Management | Audit Logs
- Table-heavy design with bulk actions (checkboxes + action bar)
- Real-time status updates with optimistic UI

**Settings**:
- Single column form layout (max-w-2xl centered)
- Sections: Account, Notifications, Role Management (admin only), Security
- Save button sticky at bottom on mobile