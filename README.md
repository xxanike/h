# Senpai Network Marketplace

A full-stack digital marketplace with Google Sign-in, UPI payment verification, and admin approval workflows. Built with React, Express, Firebase, and Tailwind CSS.

## Features

- 🔐 **Google Sign-in Authentication** - Secure authentication with Firebase
- 💳 **UPI Payment System** - QR code-based payment with manual verification
- 📦 **Product Upload & Management** - Sellers can upload digital products
- ✅ **Admin Approval Workflow** - All products require admin approval
- 💰 **Commission System** - Automatic 70/30 split (seller/marketplace)
- 📊 **Admin Panel** - Product approvals, payment verification, audit logs
- 🎨 **Beautiful UI** - Responsive design with dark mode support
- 🔒 **Role-Based Access** - Buyer, Seller, and Admin roles

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express, Node.js, TypeScript
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth (Google Sign-in)

## Getting Started

### Prerequisites

1. A Firebase project (free tier works perfectly)
2. Replit account (or Node.js 20+ installed locally)
3. 10 minutes for initial setup

### Step 1: Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" or "Add project"
   - Follow the setup wizard

2. **Add Web App**
   - In your Firebase project, click the web icon `</>`
   - Register your app with a nickname (e.g., "Senpai Marketplace")
   - Copy the config values shown

3. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable **Google** provider
   - Click Save

4. **Create Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Choose **Production mode**
   - Select your preferred location

5. **Enable Storage**
   - Go to Storage
   - Click "Get started"
   - Choose **Production mode**

6. **(Optional) Service Account for Admin SDK**
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file (keep it secure!)

### Step 2: Installation on Replit

1. **Fork this Repl** or import from GitHub

2. **Configure Environment Variables**
   
   Open the Secrets tab (🔒 icon) and add the following:

   **Required:**
   ```
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_APP_ID=1:123456:web:abc123
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
   SESSION_SECRET=your-random-32-char-secret
   MARKETPLACE_UPI_ID=anikashyap07@fam
   ```

   **Optional (Recommended):**
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account"...}
   DISCORD_WEBHOOK_URL=your-webhook-url
   ```

   💡 **Tip**: See `.env.example` for detailed setup instructions and all available options

3. **Add Authorized Domain**
   - Copy your Replit dev URL (e.g., `your-repl.replit.dev`)
   - In Firebase Console → Authentication → Settings → Authorized domains
   - Add your Replit URL

4. **Run the App**
   - The app will start automatically when you run the Repl
   - Or click the "Run" button

5. **Create First Admin User**
   - Sign in with Google
   - Go to Firebase Console → Firestore → `users` collection
   - Find your user document
   - Edit the `role` field: change `"buyer"` to `"admin"`
   - Refresh the app to see the Admin Panel

### Step 3: Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd senpai-marketplace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and fill in your Firebase credentials

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:5000
   ```

### Step 4: Add Your QR Code (Optional)

To customize the UPI QR code:

1. Generate your UPI QR code or use the provided one
2. Save it to `attached_assets/` folder
3. Update `.env`:
   ```
   MARKETPLACE_QR_IMAGE_PATH=your-qr-image.png
   ```

## Configuration

All configuration is managed through environment variables. See `.env.example` for the complete list.

### Core Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_FIREBASE_PROJECT_ID` | ✅ Yes | - | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | ✅ Yes | - | Firebase app ID |
| `VITE_FIREBASE_API_KEY` | ✅ Yes | - | Firebase API key |
| `SESSION_SECRET` | ✅ Yes | - | Session encryption secret |
| `MARKETPLACE_UPI_ID` | ✅ Yes | anikashyap07@fam | UPI ID for payments |

### Optional Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `FIREBASE_SERVICE_ACCOUNT` | - | Service account credentials (JSON or path) |
| `MARKETPLACE_QR_IMAGE_PATH` | scan here_1760606417275.png | QR code filename |
| `MARKETPLACE_COMMISSION_RATE` | 0.3 | Marketplace commission (30%) |
| `MARKETPLACE_SELLER_RATE` | 0.7 | Seller earnings rate (70%) |
| `MAX_THUMBNAIL_SIZE` | 5242880 | Max thumbnail size (5MB) |
| `MAX_FILE_SIZE` | 104857600 | Max file size (100MB) |
| `DISCORD_WEBHOOK_URL` | - | Discord webhook for notifications |
| `ADMIN_NOTIFICATION_EMAIL` | - | Admin email (placeholder) |

### UPI Payment Setup

1. The default UPI ID is `anikashyap07@fam`
2. QR code is at `attached_assets/scan here_1760606417275.png`
3. To customize:
   - Add your UPI ID to `.env`: `MARKETPLACE_UPI_ID=your-upi@id`
   - Replace the QR image in `attached_assets/`
   - Update image path in `.env`: `MARKETPLACE_QR_IMAGE_PATH=your-qr.png`

### Commission Structure

- **Seller Earnings**: 70% of sale price (configurable via `MARKETPLACE_SELLER_RATE`)
- **Marketplace Fee**: 30% of sale price (configurable via `MARKETPLACE_COMMISSION_RATE`)

These rates are calculated automatically and stored with each order.

### File Upload Limits

Configure in `.env`:
```env
MAX_THUMBNAIL_SIZE=5242880      # 5MB
MAX_FILE_SIZE=104857600         # 100MB
ALLOWED_FILE_TYPES=.pdf,.zip    # Comma-separated, empty = all types
```

## User Roles

### Buyer (Default)
- Browse approved products
- Purchase products via UPI
- View order history

### Seller
- All buyer permissions
- Upload products (pending approval)
- View earnings and payouts
- Track product approval status

### Admin
- All seller permissions
- Approve/reject products
- Verify/reject payments
- Download any file for verification
- View audit logs of all admin actions

## Deployment

This app is now **fully configured for deployment**! Choose your preferred platform:

### ⭐ Option 1: Deploy on Replit (Recommended - Easiest!)

1. Click the **Deploy** button in Replit
2. Your app will be live at `https://your-repl-name.replit.app`
3. Add this domain to Firebase Authorized Domains (see Firebase Setup below)
4. Done! Your fullstack app is live 🎉

**Pros**: Zero configuration, instant deployment, free tier available

### 🚀 Option 2: Render.com (Best Free Alternative)

The app includes a `render.yaml` configuration file for one-click deployment:

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create an account
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Render will auto-detect the configuration
6. Add your environment variables in Render dashboard
7. Click "Create Web Service"

**Pros**: Free tier, production-ready, auto-deploys from Git

### 🌐 Option 3: Other Platforms

- **Railway.app**: Similar to Render, very developer-friendly
- **Netlify/Vercel**: Frontend only (API won't work)

📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions for all platforms**

### 🔥 Post-Deployment: Firebase Setup

After deploying, update Firebase Authorized Domains:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → **Authentication** → **Settings** → **Authorized domains**
3. Add your deployment domain:
   - Replit: `your-repl.replit.app`
   - Render: `your-service.onrender.com`
   - Custom domain: `yourdomain.com`

### Custom Domain

1. Add a custom domain in your deployment platform
2. Add your custom domain to Firebase Authorized Domains
3. Update DNS records as instructed by your platform

## Security Features

- ✅ Firebase authentication with Google OAuth
- ✅ Role-based access control
- ✅ File type and size validation
- ✅ Admin action logging
- ✅ Secure file storage with Firebase
- ⚠️ Placeholder virus scan hook (implement real scanning in production)

## Admin Actions Logged

All admin actions are automatically logged to Firestore `admin_logs` collection:
- Product approvals/rejections
- Payment verifications/rejections
- File downloads
- Role changes

## Payment Verification Flow

1. Buyer clicks "Buy Now" on a product
2. QR code modal shows with UPI payment details
3. Buyer scans QR with any UPI app and pays
4. Buyer enters Transaction ID (UTR) and amount
5. Order created with `pending_verification` status
6. Admin verifies payment in Admin Panel
7. Upon verification, buyer gets download access

## Payout System

Payouts are manual and handled outside the system:
- Admin views seller earnings in the Admin Panel
- Admin pays sellers directly via UPI (anikashyap07@fam)
- Admin marks payout as completed in the system

## Optional Enhancements

The codebase includes placeholders for:
- **Discord Webhooks** - Notifications for new uploads/orders
- **Virus Scanning** - File scanning before approval (see `virusScanHook` in `server/routes.ts`)
- **Email Notifications** - Seller/buyer notifications

To implement these, update the respective sections in the code.

## Project Structure

```
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utilities and config
│   │   └── hooks/         # Custom hooks
├── server/                # Backend Express app
│   ├── routes.ts          # API routes
│   ├── config.ts          # Configuration
│   ├── firebase-admin.ts  # Firebase Admin SDK
│   └── middleware/        # Auth middleware
├── shared/                # Shared types and schemas
│   └── schema.ts          # Zod schemas
└── attached_assets/       # Static assets (QR code)
```

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user

### Configuration
- `GET /api/config/marketplace` - Get marketplace config (UPI ID, commission rates)

### Products
- `GET /api/products/approved` - List approved products
- `GET /api/products/:id` - Get product details
- `GET /api/products/my` - Get seller's products
- `POST /api/products` - Upload product (seller only)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my` - Get seller's orders

### Admin
- `GET /api/admin/products/pending` - Pending approvals
- `POST /api/admin/products/:id/approve` - Approve product
- `POST /api/admin/products/:id/reject` - Reject product
- `GET /api/admin/orders/pending` - Pending payments
- `POST /api/admin/orders/:id/verify` - Verify payment
- `POST /api/admin/orders/:id/reject` - Reject payment
- `GET /api/admin/products/:id/download` - Download file
- `GET /api/admin/logs` - Get audit logs

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that all Firebase environment variables are set correctly in Replit Secrets or `.env`
- Verify `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`
- Make sure there are no extra spaces in the values

### "No authentication token provided"
- Sign in with Google first
- Check that Firebase authentication is properly configured
- Verify your domain is in Firebase Authorized Domains

### Products not showing
- Ensure products are approved by an admin
- Check Admin Panel → Pending Approvals
- Verify Firestore is accessible

### Upload failing
- Check file size limits in `.env` configuration
- Verify Firebase Storage is enabled in Firebase Console
- Check browser console for detailed error messages
- Ensure you have the "seller" role

### Payment verification not working
- Make sure you're logged in as admin
- Check that the order exists in Firestore
- Verify transaction ID is entered correctly

### Configuration not loading
- Verify all required environment variables are set
- Check the Replit Secrets tab or `.env` file
- Restart the application after adding new secrets

### Service account errors
- If using `FIREBASE_SERVICE_ACCOUNT`, ensure the JSON is valid
- For Replit, paste the entire JSON as a single-line string in Secrets
- Alternatively, leave it empty to use Application Default Credentials

## Support

For issues or questions:
1. Check the Firebase Console for errors
2. Review Replit logs for backend errors
3. Check browser console for frontend errors

## License

MIT License - feel free to use this for your own projects!

## Credits

Built with ❤️ using Replit, Firebase, and modern web technologies.
