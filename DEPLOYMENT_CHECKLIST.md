# 🚀 Production Deployment Checklist for Budget Buddy

## Pre-Deployment Checklist

### Backend Environment Variables (.env on Production Server)

Make sure these are set on your production backend (Render, Railway, etc.):

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=your-production-mongodb-connection-string

# JWT Secret (USE A STRONG RANDOM SECRET!)
JWT_SECRET=your-production-secret-key-min-32-chars-very-secure

# CORS Allowed Origins (comma-separated - your frontend URL)
ALLOWED_ORIGINS=https://your-frontend-domain.com

# SMTP Configuration for Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password

# Frontend URL for Email Links
FRONTEND_URL=https://your-frontend-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-production-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
GOOGLE_REDIRECT_URI=https://your-frontend-domain.com

# Cloudinary (if using profile pictures)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend Environment Variables (.env on Production Server or Build Settings)

```env
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_GOOGLE_CLIENT_ID=your-production-google-client-id.apps.googleusercontent.com
```

### Google Cloud Console Configuration

1. **Update Authorized JavaScript origins:**
   - Add: `https://your-frontend-domain.com`

2. **Update Authorized redirect URIs:**
   - Add: `https://your-frontend-domain.com`

3. **Update OAuth consent screen:**
   - If not published, publish it or add test users
   - Add your production domain

### Important URLs to Update

Replace these placeholders with your actual production URLs:
- `https://your-frontend-domain.com` → Your actual frontend URL (e.g., Vercel, Netlify)
- `https://your-backend-domain.com` → Your actual backend URL (e.g., Render, Railway)

## Features Status

✅ **Email Verification with OTP** - Working
✅ **Password Reset** - Working  
✅ **Password Change in Settings** - Working
✅ **Google Sign-In** - Working
✅ **Theme Support** - Working

## Testing Before Deployment

- [ ] Test OTP email verification with production SMTP
- [ ] Test password reset email with production SMTP
- [ ] Test Google Sign-In with production credentials
- [ ] Test password change in Settings
- [ ] Verify all emails include correct production URLs
- [ ] Test CORS with production URLs
- [ ] Verify database connection

## Security Checklist

- [ ] Strong JWT_SECRET (minimum 32 characters, random)
- [ ] Production MongoDB connection string
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS properly configured with production URLs
- [ ] Environment variables NOT committed to Git (already in .gitignore ✅)
- [ ] SMTP credentials are secure
- [ ] Google OAuth credentials are secure

## After Deployment

1. Test the deployed app thoroughly
2. Monitor backend logs for errors
3. Check that emails are being sent
4. Verify Google Sign-In works
5. Test password reset flow
6. Check OTP verification

## Rollback Plan

If something goes wrong:
1. Keep old deployment running
2. Revert environment variables
3. Check logs for errors
4. Fix issues and redeploy

---

**You're all set! The features are implemented and working. Just update the environment variables with your production URLs and credentials.**

