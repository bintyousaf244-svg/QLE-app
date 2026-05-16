# QLE-App Deployment Guide

## Setup Overview

Your Quranic Linguistic Explorer app is now configured to run with:
- **Backend**: Render (https://qle-app.onrender.com)
- **Database**: Supabase PostgreSQL
- **Mobile App**: Expo (React Native)

## Current Configuration

### Backend (api-server)
- Environment variables configured in `.env.local`
- Database: PostgreSQL on Supabase
- API base URL: `https://qle-app.onrender.com/api`

### Frontend (quran-app)
- Environment variables configured in `.env.local`
- Points to Render backend
- Built with Expo/React Native

## Deployment Steps

### 1. Deploy Backend to Render

1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new **Web Service**
4. Configure:
   - **Name**: qle-app
   - **Runtime**: Node
   - **Build Command**: 
     ```
     cd artifacts/api-server && pnpm install && pnpm run build
     ```
   - **Start Command**: 
     ```
     cd artifacts/api-server && pnpm run start
     ```

5. Add Environment Variables:
   - `DATABASE_URL`: `postgresql://postgres.znntitoiilpsahhdrvyv:QuihItn4kCXtgkxb@aws-1-ap-south-1.pooler.supabase.com:6543/postgres`
   - `NODE_ENV`: `production`
   - `PORT`: `3000`

6. Deploy!

### 2. Update Mobile App

The Expo app is already configured to point to your Render backend:
- It uses the `EXPO_PUBLIC_DOMAIN` environment variable
- Default: `qle-app.onrender.com`

### 3. Build & Test Locally

```bash
cd artifacts/quran-app
pnpm install
pnpm run dev  # Starts Expo dev server
```

### 4. Build APK

```bash
cd artifacts/quran-app
eas build --platform android
```

Or for local build:
```bash
cd artifacts/quran-app
npx expo run:android
```

## Troubleshooting

### Backend not connecting
- Check Render deployment logs
- Verify DATABASE_URL is correct in Render environment
- Test database connection: `psql postgresql://...`

### App can't reach API
- Verify EXPO_PUBLIC_DOMAIN is set correctly
- Check network requests in Expo DevTools
- Ensure Render service is running (check status on render.com)

### Database issues
- Verify Supabase connection string
- Check PostgreSQL user permissions
- Ensure all migrations have run

## Files Modified

- `.env.local` — Local environment variables (not committed)
- `.env.example` — Template for team reference
- `render.yaml` — Render deployment configuration
- `.gitignore` — Updated to exclude `.env` files

## Next Steps

1. ✅ Configure environment variables
2. → Deploy backend to Render
3. → Test backend API at `https://qle-app.onrender.com/api`
4. → Build and test Expo app
5. → Deploy to Play Store/App Store
