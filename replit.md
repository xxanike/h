# Senpai Network Marketplace

## Project Overview
A full-stack digital marketplace built with React, Express, Firebase, and Tailwind CSS. Features Google Sign-in authentication, UPI payment verification, product uploads with admin approval, and a comprehensive admin panel.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, React Query
- **Backend**: Express, Node.js, TypeScript, Firebase Admin SDK
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage  
- **Authentication**: Firebase Auth (Google Sign-in only)

## Key Features
- 🔐 Google Sign-in authentication with role-based access (buyer/seller/admin)
- 💳 UPI payment system with QR code and manual admin verification
- 📦 Product upload and management for sellers
- ✅ Admin approval workflow for all products
- 💰 Automatic 70/30 commission split (seller/marketplace)
- 📊 Admin panel with product approvals, payment verification, and audit logs
- 🎨 Responsive design with dark mode support
- 🔒 Secure file uploads with Firebase Storage

## Project Structure
```
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components (Home, Product, Profile, Settings, Admin, Login)
│   │   ├── contexts/         # React contexts (Auth, Theme)
│   │   ├── lib/              # Utilities (Firebase, Auth, QueryClient)
│   │   └── hooks/            # Custom hooks
├── server/                   # Backend Express app
│   ├── routes.ts             # All API routes
│   ├── config.ts             # Environment configuration
│   ├── firebase-admin.ts     # Firebase Admin SDK setup
│   └── middleware/auth.ts    # Authentication middleware
├── shared/                   # Shared TypeScript types
│   └── schema.ts             # Zod schemas for all data models
├── attached_assets/          # Static assets (UPI QR code image)
└── design_guidelines.md      # UI/UX design guidelines
```

## Data Models

### User
- `id` (string) - Firebase UID
- `email` (string)
- `displayName` (string)
- `photoURL` (string, optional)
- `role` (enum: "buyer" | "seller" | "admin")
- `createdAt` (ISO timestamp)

### Product
- `id` (string)
- `title` (string)
- `description` (string)
- `price` (number) - in rupees (₹)
- `tags` (string[])
- `thumbnailURL` (string) - Firebase Storage URL
- `fileURL` (string) - Firebase Storage URL
- `fileName` (string)
- `fileSize` (number) - in bytes
- `sellerId` (string)
- `sellerName` (string)
- `sellerPhotoURL` (string, optional)
- `status` (enum: "pending" | "approved" | "rejected")
- `rejectionReason` (string, optional)
- `createdAt` (ISO timestamp)
- `approvedAt` (ISO timestamp, optional)

### Order
- `id` (string)
- `productId` (string)
- `productTitle` (string)
- `buyerId` (string)
- `buyerName` (string)
- `buyerEmail` (string)
- `sellerId` (string)
- `transactionId` (string) - 12-digit UTR number
- `amount` (number) - payment amount in ₹
- `status` (enum: "pending_verification" | "verified" | "rejected")
- `downloadURL` (string, optional) - available after verification
- `sellerEarnings` (number) - 70% of amount
- `marketplaceCommission` (number) - 30% of amount
- `createdAt` (ISO timestamp)
- `verifiedAt` (ISO timestamp, optional)

### AdminLog
- `id` (string)
- `action` (enum: "approve_product" | "reject_product" | "verify_payment" | "reject_payment" | "download_file" | "update_role")
- `adminId` (string)
- `adminName` (string)
- `targetId` (string) - ID of affected resource
- `targetType` (enum: "product" | "order" | "user")
- `details` (string) - description of action
- `createdAt` (ISO timestamp)

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user (creates user on first login)

### Products
- `GET /api/products/approved` - List all approved products (public)
- `GET /api/products/:id` - Get single product (public)
- `GET /api/products/my` - Get seller's products (seller only)
- `POST /api/products` - Upload product with files (seller only)

### Orders
- `POST /api/orders` - Create order after payment
- `GET /api/orders/my` - Get seller's orders (seller only)

### Admin
- `GET /api/admin/products/pending` - Get pending product approvals (admin only)
- `POST /api/admin/products/:id/approve` - Approve product (admin only)
- `POST /api/admin/products/:id/reject` - Reject product with reason (admin only)
- `GET /api/admin/orders/pending` - Get pending payment verifications (admin only)
- `POST /api/admin/orders/:id/verify` - Verify payment and grant download access (admin only)
- `POST /api/admin/orders/:id/reject` - Reject payment (admin only)
- `GET /api/admin/products/:id/download` - Download product file for verification (admin only)
- `GET /api/admin/logs` - Get admin action audit logs (admin only)

## User Roles & Permissions

### Buyer (Default)
- Browse approved products
- Purchase products via UPI
- View order history
- Cannot upload products

### Seller
- All buyer permissions
- Upload products (pending approval)
- View own products and their status
- View earnings from verified orders
- Track approval status

### Admin
- All seller permissions
- Approve/reject product uploads
- Verify/reject payment submissions
- Download any file for verification
- View complete audit log of admin actions
- All actions are automatically logged

## User Flows

### First-Time Login Flow
1. User clicks "Continue with Google" on login page
2. Firebase Auth redirects to Google Sign-in
3. On redirect back, user is created in Firestore with role "buyer"
4. User is redirected to home page

### Seller Product Upload Flow
1. Seller clicks floating "+" button or "Upload Product"
2. Fills form: title, description, price, tags
3. Uploads thumbnail image (max 5MB) and product file (max 100MB)
4. Files uploaded to Firebase Storage
5. Product created in Firestore with status "pending"
6. Admin receives notification (optional Discord webhook)
7. Seller sees product in "My Products" with "pending" badge

### Admin Product Approval Flow
1. Admin navigates to Admin Panel → Pending Approvals
2. Reviews product details, thumbnail, and metadata
3. Can download file for verification
4. Clicks "Approve" or "Reject" (with reason)
5. Status updated in Firestore
6. Action logged to admin_logs collection
7. Product appears in marketplace (if approved)

### Buyer Purchase Flow
1. Buyer browses approved products on home page
2. Clicks "Buy Now" on desired product
3. Modal shows:
   - UPI QR code (scan here.png)
   - UPI ID: anikashyap07@fam
   - Product price
4. Buyer scans QR with UPI app and pays
5. Buyer enters 12-digit Transaction ID (UTR) and amount
6. Order created with status "pending_verification"
7. Admin receives notification (optional)

### Admin Payment Verification Flow
1. Admin navigates to Admin Panel → Payment Verification
2. Reviews pending orders with transaction IDs
3. Verifies payment in UPI app/bank statement
4. Clicks "Verify" if valid, "Reject" if invalid
5. On verification:
   - Order status changed to "verified"
   - Download URL added to order
   - Buyer can now download file
   - Seller earns 70% commission
6. Action logged to admin_logs

## Configuration

### Environment Variables (Replit Secrets)
```
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_API_KEY=your-api-key
SESSION_SECRET=your-session-secret
DISCORD_WEBHOOK_URL=optional-discord-webhook (for notifications)
```

### Marketplace Settings (hardcoded in server/config.ts)
- UPI ID: anikashyap07@fam
- Commission: 30% marketplace, 70% seller
- Max thumbnail size: 5MB
- Max product file size: 100MB
- Allowed thumbnail types: JPEG, PNG, GIF, WebP

### QR Code Asset
- Location: `attached_assets/scan here_1760606417275.png`
- Used in: BuyModal component
- Shows UPI payment QR for anikashyap07@fam

## Creating an Admin User
1. Sign in with Google as a new user
2. Go to Firebase Console → Firestore
3. Navigate to `users` collection
4. Find your user document (by email)
5. Edit the `role` field from `"buyer"` to `"admin"`
6. Refresh the app - Admin Panel will now be accessible

## Security Features
- ✅ Firebase Authentication with Google OAuth
- ✅ Role-based access control (buyer/seller/admin)
- ✅ Protected API routes with authentication middleware
- ✅ File type and size validation
- ✅ Admin action logging (audit trail)
- ✅ Secure file storage with Firebase
- ⚠️ Placeholder virus scan hook (implement in production)

## Development Workflow
1. Run `npm run dev` to start Express + Vite dev server
2. Backend runs on port 5000
3. Frontend served by Vite, proxied through Express
4. Hot reload enabled for both frontend and backend

## Firebase Setup Required
1. Create Firebase project
2. Enable Google Sign-in in Authentication
3. Create Firestore database
4. Enable Firebase Storage
5. Add Replit domain to Authorized Domains
6. Copy config values to Replit Secrets

## Known Limitations & Future Enhancements
- Manual payout system (admin pays sellers via UPI offline)
- No automatic virus scanning (placeholder hook provided)
- No email notifications (Discord webhook placeholder provided)
- No seller analytics dashboard (can be added)
- No buyer order history page (can be added)
- No product search/filtering beyond category tags

## Recent Changes (October 2025)
- **Configuration Management Overhaul**: All sensitive data now properly managed via environment variables
  - Removed hardcoded UPI ID, now configurable via `MARKETPLACE_UPI_ID`
  - Added comprehensive `.env.example` with detailed setup instructions
  - Implemented startup validation that fails if required config is missing
  - Added secure marketplace config API endpoint (`/api/config/marketplace`)
- **Security Enhancements**:
  - Firebase Admin SDK now supports service account credentials with path traversal protection
  - Marketplace config endpoint requires authentication
  - BuyModal properly validates and handles config loading errors
  - No sensitive data exposed in API responses
- **Developer Experience**:
  - Updated README with step-by-step setup guide
  - All configuration options documented in `.env.example`
  - Clear error messages for missing configuration
  - Commission rates now dynamically fetched from backend

## Previous Changes
- Implemented complete authentication flow with Firebase
- Built all frontend pages with responsive design and dark mode
- Created comprehensive admin panel with audit logging
- Implemented file upload to Firebase Storage
- Added commission calculation (70/30 split)
- Fixed React Query authentication to include Firebase ID tokens
- All API routes protected with proper authentication middleware

## Testing Checklist
- [ ] Google Sign-in creates user
- [ ] Seller can upload products
- [ ] Admin can approve/reject products
- [ ] Approved products show in marketplace
- [ ] Buyer can initiate purchase
- [ ] Admin can verify payments
- [ ] Verified orders provide download access
- [ ] Commission calculations are correct
- [ ] Admin actions are logged
- [ ] Role-based access works correctly
- [ ] Dark mode toggles properly
- [ ] Responsive design works on mobile
