// Configuration file for environment variables
// This reads from environment variables (.env file or Replit secrets)

export const config = {
  // Firebase configuration (frontend)
  firebase: {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
    appId: process.env.VITE_FIREBASE_APP_ID || "",
    apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  },
  
  // Firebase Admin SDK (backend)
  firebaseAdmin: {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
    // Service account credentials (JSON string or path)
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || "",
  },
  
  // Marketplace configuration
  marketplace: {
    upiId: process.env.MARKETPLACE_UPI_ID || "anikashyap07@fam",
    qrImagePath: process.env.MARKETPLACE_QR_IMAGE_PATH || "scan here_1760606417275.png",
    commissionRate: parseFloat(process.env.MARKETPLACE_COMMISSION_RATE || "0.3"),
    sellerRate: parseFloat(process.env.MARKETPLACE_SELLER_RATE || "0.7"),
  },

  // Optional: Discord webhook for notifications (placeholder)
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || "",
  },

  // Session secret (required for session management)
  sessionSecret: process.env.SESSION_SECRET || "",

  // Google OAuth (required for authentication)
  googleOAuth: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://senpainetwork.netlify.app/api/auth/google/callback",
  },

  // File upload limits
  upload: {
    maxThumbnailSize: parseInt(process.env.MAX_THUMBNAIL_SIZE || "5242880"), // 5MB default
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "104857600"), // 100MB default
    allowedThumbnailTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || "").split(",").filter(Boolean),
  },

  // Admin email notifications (optional placeholder)
  admin: {
    notificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || "",
  },

  // Environment
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};

// Helper to check if Firebase is configured
export function isFirebaseConfigured(): boolean {
  return !!(config.firebase.projectId && config.firebase.appId && config.firebase.apiKey);
}

// Helper to check if Firebase Admin is configured
export function isFirebaseAdminConfigured(): boolean {
  return !!(config.firebaseAdmin.projectId);
}

// Validate required configuration
export function validateConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!config.googleOAuth.clientId) missing.push("GOOGLE_CLIENT_ID");
  if (!config.googleOAuth.clientSecret) missing.push("GOOGLE_CLIENT_SECRET");
  if (!config.sessionSecret) {
    missing.push("SESSION_SECRET");
  }
  if (!config.marketplace.upiId) missing.push("MARKETPLACE_UPI_ID");

  return {
    valid: missing.length === 0,
    missing,
  };
}

// Validate configuration at startup and fail fast if critical config is missing
export function validateConfigOrExit(): void {
  const validation = validateConfig();
  
  if (!validation.valid) {
    console.error("❌ Configuration Error: Missing required environment variables:");
    validation.missing.forEach(key => console.error(`   - ${key}`));
    console.error("\nPlease check your .env file or Replit Secrets.");
    console.error("See .env.example for required configuration.\n");
    process.exit(1);
  }
  
  console.log("✅ Configuration validated successfully");
}
