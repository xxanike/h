# Google OAuth Setup Guide

## ⚠️ Important: Do You Need This?

**Your app already uses Firebase Authentication for Google Sign-in!**

You only need Google OAuth Client ID & Secret if you want to:
- Access additional Google APIs (Drive, Calendar, Gmail, etc.)
- Use Google OAuth independently from Firebase
- Implement server-side Google authentication

**For basic Google Sign-in, Firebase handles everything automatically - no extra setup needed!**

---

## When You DO Need Google OAuth Credentials

If you need extended Google API access, follow these steps:

### Step 1: Create OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Select your Firebase project (or create a new project)

2. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable the APIs you need (e.g., Google Drive API)

3. **Create OAuth Client ID**
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Name it: "Senpai Marketplace OAuth"

4. **Configure Authorized Origins**
   Add these URLs:
   ```
   http://localhost:5000
   https://your-repl.replit.dev
   https://your-deployment-domain.com
   ```

5. **Configure Redirect URIs**
   Add these URLs:
   ```
   http://localhost:5000/auth/google/callback
   https://your-repl.replit.dev/auth/google/callback
   https://your-deployment-domain.com/auth/google/callback
   ```

6. **Copy Credentials**
   - You'll see your **Client ID** and **Client Secret**
   - Copy both values

### Step 2: Add to Replit Secrets

1. Open the **Secrets** tab (🔒 icon) in Replit
2. Add these two secrets:
   ```
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here
   ```
3. Save and restart your app

### Step 3: Configure Firebase (if needed)

If you're using both Firebase Auth and Google OAuth:

1. **Add OAuth Credentials to Firebase**
   - Go to Firebase Console → Authentication → Sign-in method
   - Click on Google provider
   - Scroll to "Web SDK configuration"
   - Add your Web Client ID and Client Secret

2. **This enables**:
   - Server-side token verification
   - Access to Google APIs with user consent
   - Offline access with refresh tokens

---

## Security Best Practices

✅ **DO:**
- Store Client ID & Secret in Replit Secrets (never in code)
- Use environment variables to access them
- Restrict authorized domains to your actual domains
- Use HTTPS in production
- Regularly rotate secrets

❌ **DON'T:**
- Commit secrets to Git
- Share secrets publicly
- Use the same credentials for dev and production
- Hardcode credentials in your code

---

## Environment Variables Reference

After setup, your app will have access to:

```javascript
// Frontend (via import.meta.env)
VITE_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID

// Backend (via process.env)
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
SESSION_SECRET
FIREBASE_SERVICE_ACCOUNT
```

---

## Testing OAuth Setup

1. **Check Configuration**
   ```bash
   # In Replit Shell
   env | grep GOOGLE_CLIENT
   ```

2. **Test Sign-in Flow**
   - Click "Continue with Google" in your app
   - Should redirect to Google consent screen
   - After approval, should redirect back to your app

3. **Verify in Logs**
   - Check Replit console for auth success messages
   - No errors should appear

---

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
→ Add your exact redirect URI to Google Cloud Console

### "Error: invalid_client"
→ Check Client ID and Secret are correct in Replit Secrets

### "Error 401: Unauthorized"
→ Verify your domain is in Firebase Authorized Domains

### OAuth popup blocked
→ User's browser is blocking popups. Ask them to allow popups for your site

---

## Quick Setup Checklist

- [ ] Created OAuth Client ID in Google Cloud Console
- [ ] Added authorized origins (localhost + deployment URL)
- [ ] Added redirect URIs with `/auth/google/callback`
- [ ] Copied Client ID to Replit Secrets as `GOOGLE_CLIENT_ID`
- [ ] Copied Client Secret to Replit Secrets as `GOOGLE_CLIENT_SECRET`
- [ ] Restarted the Replit app
- [ ] Tested Google Sign-in
- [ ] Verified no errors in console

---

## Need Help?

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Firebase Auth with Google](https://firebase.google.com/docs/auth/web/google-signin)
- Check Replit logs for error messages
- Verify all environment variables are set correctly

Remember: **Most apps don't need these credentials!** Firebase Auth handles Google Sign-in automatically. Only add these if you specifically need extended Google API access.
