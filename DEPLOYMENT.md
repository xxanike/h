# Deployment Guide

This is a **fullstack application** with Express backend + React frontend. Here's how to deploy it properly:

---

## ⚠️ Important: Backend vs Frontend

This app has TWO parts:
1. **Frontend** - React app (static files)
2. **Backend** - Express API server (Node.js server)

**Most static hosting platforms (Netlify, Vercel, GitHub Pages) only support frontend static files.**

---

## 🎯 Recommended: Deploy on Replit (Easiest!)

Replit supports fullstack apps natively - both frontend and backend work out of the box!

### Steps:
1. Click the **Deploy** button in Replit
2. Your app will be live at `https://your-repl-name.replit.app`
3. Add this domain to Firebase Authorized Domains (see Firebase Setup below)

✅ **Pros**: Zero configuration, works instantly, free tier available
❌ **Cons**: Requires Replit account

---

## 🚀 Option 1: Render.com (Best Free Alternative)

Render.com supports fullstack Node.js apps with a generous free tier.

### Steps:

1. **Create Render Account**: Go to [render.com](https://render.com) and sign up

2. **Connect Your GitHub Repo**: 
   - Push this code to GitHub
   - In Render dashboard, click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service** (Render will auto-detect from `render.yaml`):
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Set environment variables (see Environment Variables section below)

4. **Deploy**: Click "Create Web Service"

✅ **Pros**: Free tier, supports fullstack apps, auto-deploys from Git
❌ **Cons**: Free tier spins down after 15 min of inactivity

---

## 🌐 Option 2: Railway.app

Similar to Render, supports fullstack Node.js apps.

### Steps:

1. **Create Railway Account**: Go to [railway.app](https://railway.app)

2. **New Project from GitHub**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure**:
   - Railway auto-detects Node.js
   - Add environment variables (see below)
   - Set start command to `npm start`

4. **Deploy**: Railway automatically deploys

✅ **Pros**: Very developer-friendly, free $5/month credit
❌ **Cons**: Requires credit card after trial

---

## 📦 Option 3: Split Deployment (Frontend + Backend Separate)

Deploy frontend and backend to different services.

### Frontend → Netlify/Vercel
1. Build frontend: `npm run build`
2. Deploy `dist/public/` folder to Netlify or Vercel
3. Configure environment variables with `VITE_` prefix

### Backend → Render/Railway
1. Create a separate repo with just `server/` folder
2. Update package.json to only run backend
3. Deploy to Render or Railway

⚠️ **Note**: You'll need to configure CORS and update API URLs

---

## 🔧 Environment Variables

All deployment platforms need these environment variables:

### Required:
```
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=1:123456:web:abc123
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXX
SESSION_SECRET=your-random-32-char-secret
```

### Optional:
```
MARKETPLACE_UPI_ID=your-upi@id
MARKETPLACE_QR_IMAGE_PATH=your-qr-code.png
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
DISCORD_WEBHOOK_URL=your-discord-webhook
```

---

## 🔥 Firebase Setup for Deployment

After deploying, update Firebase settings:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your deployment domain:
   - Replit: `your-repl.replit.app`
   - Render: `your-service.onrender.com`
   - Railway: `your-app.up.railway.app`
   - Netlify: `your-site.netlify.app`

---

## 📝 Static Hosting (Frontend Only)

If you ONLY want to deploy the frontend (without backend functionality):

### Netlify
```bash
npm run build
# Upload dist/public/ folder
```

### Vercel
```bash
npm run build
vercel --prod
```

### GitHub Pages
```bash
npm run build
# Deploy dist/public/ to gh-pages branch
```

⚠️ **Warning**: Backend features (authentication, file uploads, database) won't work without a backend server!

---

## 🎨 Quick Comparison

| Platform | Type | Backend Support | Free Tier | Best For |
|----------|------|-----------------|-----------|----------|
| **Replit** | Fullstack | ✅ Yes | ✅ Yes | Fastest setup |
| **Render** | Fullstack | ✅ Yes | ✅ Yes | Production apps |
| **Railway** | Fullstack | ✅ Yes | ✅ $5 credit | Modern apps |
| **Netlify** | Static | ❌ No | ✅ Yes | Frontend only |
| **Vercel** | Static | ⚠️ Serverless | ✅ Yes | Frontend only |

---

## ✅ Post-Deployment Checklist

- [ ] App is accessible at deployment URL
- [ ] Firebase Authorized Domain is updated
- [ ] Environment variables are set correctly
- [ ] Google Sign-in works
- [ ] File uploads work
- [ ] Payment QR code displays correctly
- [ ] Admin panel is accessible
- [ ] Created first admin user in Firestore

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
→ Add your deployment domain to Firebase Authorized Domains

### "API endpoints return 404"
→ You're using static hosting (Netlify/Vercel). Use Render/Railway instead.

### "Application error" or "Cannot find module"
→ Check build logs, ensure all dependencies are in `package.json` (not devDependencies)

### "CORS errors"
→ If using split deployment, configure CORS in backend to allow frontend domain

---

## 📞 Need Help?

- Check logs in your deployment platform
- Review Firestore security rules
- Ensure all environment variables are set
- Verify Firebase configuration

Happy deploying! 🚀
