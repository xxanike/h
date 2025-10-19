// Firebase Admin SDK initialization
import admin from "firebase-admin";
import { config } from "./config";

// Initialize Firebase Admin SDK
// Supports multiple authentication methods:
// 1. Service account JSON string in FIREBASE_SERVICE_ACCOUNT env var
// 2. Service account file path in GOOGLE_APPLICATION_CREDENTIALS env var
// 3. Application Default Credentials (ADC) when running on Google Cloud/Replit
if (!admin.apps.length) {
  let adminConfig: admin.AppOptions = {
    projectId: config.firebaseAdmin.projectId,
  };

  // Check if service account credentials are provided
  if (config.firebaseAdmin.serviceAccount) {
    try {
      // Try to parse as JSON string first
      const serviceAccount = JSON.parse(config.firebaseAdmin.serviceAccount);
      adminConfig.credential = admin.credential.cert(serviceAccount);
      console.log("✅ Firebase Admin initialized with service account credentials");
    } catch (e) {
      // If parsing fails, it might be a file path
      // Security: Only allow absolute paths or paths starting with ./ to prevent path traversal
      const path = config.firebaseAdmin.serviceAccount;
      if (path.endsWith('.json') && (path.startsWith('/') || path.startsWith('./'))) {
        try {
          const fs = require('fs');
          const serviceAccountJson = JSON.parse(fs.readFileSync(path, 'utf8'));
          adminConfig.credential = admin.credential.cert(serviceAccountJson);
          console.log("✅ Firebase Admin initialized with service account file");
        } catch (fileError) {
          console.error("❌ Failed to read service account file:", fileError);
          console.warn("⚠️  Using Application Default Credentials (ADC) as fallback");
        }
      } else {
        console.warn("⚠️  Invalid FIREBASE_SERVICE_ACCOUNT format. Expected JSON string or valid file path.");
        console.warn("⚠️  Using Application Default Credentials (ADC) as fallback");
      }
    }
  } else {
    console.log("ℹ️  Firebase Admin initialized with Application Default Credentials (ADC)");
  }

  admin.initializeApp(adminConfig);
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();

// Helper to verify Firebase ID token
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error("Invalid authentication token");
  }
}
