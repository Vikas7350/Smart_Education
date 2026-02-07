# 🚀 Deployment Guide - Vercel & Render

## Overview
- **Frontend:** Next.js app → Vercel
- **Backend:** Node.js/Express → Render
- **Database:** MongoDB Atlas (already configured)

---

## Step 1: Push Code to GitHub

### 1.1 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `smart-education`
3. Make it **Public**
4. Click "Create repository"

### 1.2 Initialize Git and Push
```bash
cd c:\Users\vikas\smart_education

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Smart Education App"

# Add remote
git remote add origin https://github.com/Vikas7350/Education.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
- Go to https://render.com
- Sign up with GitHub (recommended)

### 2.2 Create Web Service
1. Click "New +" button
2. Select "Web Service"
3. Connect GitHub (authorize Render)
4. Select your `smart-education` repository
5. Select `main` branch

### 2.3 Configure Render Service

Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `synapse-academy-backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Region** | Choose closest to your users |

### 2.4 Add Environment Variables

Click "Advanced" → "Add Environment Variable" for each:

```
PORT=5000
MONGODB_URI=mongodb+srv://vikaschoudhary7058_db_user:Bh6fD7Htglaqs1mX@smart-education-73.nj6ftbv.mongodb.net/?appName=smart-education-73
JWT_SECRET=64757c7bc43640f2d32de68d286d0207fef67877aa2197e09be0d20b34b97c6025e935478d2c15a3822b999b82104d66dda525ddc1efdcea1f8231bcb11c04c3
GEMINI_API_KEY=AIzaSyB0doY7_zOpgNl2hrf6sipNBptTs_c1ZTw
RAZORPAY_KEY_ID=rzp_test_RdhiW77AGH2dd4
RAZORPAY_KEY_SECRET=UxwB6jfqSq15uK2n1M6j6xhO
FRONTEND_URL=https://synapse-academy.vercel.app
```

### 2.5 Deploy
Click "Create Web Service" button.

**Wait for it to deploy.** You'll see a URL like:
```
https://synapse-academy-backend.onrender.com
```
**Save this URL** - you need it for the frontend!

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub (recommended)

### 3.2 Import Project
1. Click "Add New"
2. Select "Project"
3. Search for `smart-education`
4. Click "Import"

### 3.3 Configure Frontend

**Important:** In the configuration form:

#### Root Directory
- Click the dropdown
- Select `frontend`

#### Environment Variables
Add ONE environment variable:

```
NEXT_PUBLIC_API_URL=https://synapse-academy-backend.onrender.com/api
```

Replace the URL with **your actual Render backend URL** from Step 2.5!

### 3.4 Deploy
Click "Deploy" button.

**Wait for deployment.** You'll get a URL like:
```
https://synapse-academy.vercel.app
```

---

## Step 4: Test Deployment

### 4.1 Test Frontend
1. Open your Vercel URL in browser
2. **Should show Login page** ✅
3. Try registering a new account
4. Check that Dashboard loads
5. Click on Subjects to browse content

### 4.2 Check Browser Console
- Press **F12** to open DevTools
- Go to **Console** tab
- Should NOT see red error messages
- Use **Network** tab to verify API calls are going to your Render URL

### 4.3 Test API Connectivity
1. Login to your account
2. Go to Dashboard
3. Click on a Subject → should load chapters
4. Go to Subscription page
5. Click "Subscribe" → Razorpay modal should open

### 4.4 If You See Errors

**"Failed to connect to API"**
- Check `NEXT_PUBLIC_API_URL` in Vercel > Settings > Environment Variables
- Verify backend URL is correct
- Make sure Render backend is running (check Render dashboard)

**"CORS error"**
- Backend needs to know your Vercel URL
- In Render > Settings > Environment Variables
- Update: `FRONTEND_URL=https://YOUR_VERCEL_URL.vercel.app`
- Redeploy backend

**Payment not working**
- This is **test mode** - use Razorpay test credentials
- To go live, you need production keys from Razorpay

---

## Critical Configuration

### For Production CORS

Your backend must allow requests from your Vercel URL. In `backend/server.js`, the CORS is configured to allow:
- `localhost:3000` (development)
- `localhost:5000` (development)
- `https://synapse-academy.vercel.app` (production)
- Any URL in `process.env.FRONTEND_URL`

If you used a different Vercel URL, update the CORS in backend code or set `FRONTEND_URL` environment variable.

---

## Important Notes

### Render Free Tier
- Spins down after 15 minutes of inactivity
- For production, upgrade to Starter tier ($7/month)
- Free tier is fine for testing

### Vercel Free Tier
- **No limitations** - fully functional
- Can upgrade anytime for faster builds

### Keep Secrets Safe
- Never commit `.env` files to GitHub
- Environment variables in Render/Vercel dashboards are private
- MongoDB credentials are securely stored

### To Go Live (Optional)
1. Replace Razorpay test keys with production keys
2. Upgrade Render from free to Starter tier
3. Use production MongoDB credentials (if switching databases)
4. Purchase a custom domain

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render backend deployed
  - [ ] Environment variables set
  - [ ] Connected to MongoDB
  - [ ] Get Render URL
- [ ] Vercel frontend deployed
  - [ ] Root directory set to `frontend`
  - [ ] `NEXT_PUBLIC_API_URL` points to Render
  - [ ] Get Vercel URL
- [ ] Test login/register
- [ ] Test dashboard access
- [ ] Test subscription payment
- [ ] No errors in browser console

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Render showing "Build Failed" | Check build logs, usually missing dependencies |
| Vercel showing "Not Found" | Ensure root directory is set to `frontend` |
| API returns 404 | Backend routes might not exist, check Render logs |
| Login doesn't work | Check `NEXT_PUBLIC_API_URL` is correct in Vercel settings |
| "No subscription found" | Normal - users start with no subscription, click Subscribe |
| Razorpay modal won't open | Check browser console, verify payment gateway enabled |

---

## After Deployment

### Monitor Performance
- Render: Dashboard > Logs section
- Vercel: Deployments > select latest > Runtime Logs

### Update Code
1. Make changes locally
2. Commit: `git add . && git commit -m "Message"`
3. Push: `git push`
4. Both services auto-redeploy (if connected to GitHub)

### Environment Variable Updates
- Restart service after changing variables
- Render: Click "Restart Service" button
- Vercel: Any environment variable change auto-redeploys

---

## Support
- Vercel docs: https://vercel.com/docs
- Render docs: https://render.com/docs
- Next.js docs: https://nextjs.org/docs
- Express docs: https://expressjs.com

---

**Total deployment time: ~30-45 minutes**

Good luck! 🎉
