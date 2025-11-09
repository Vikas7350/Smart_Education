# 🚀 Quick Start Guide

## Step 1: Install Dependencies

```bash
npm run install:all
```

This will install dependencies for root, frontend, and backend.

## Step 2: Set Up Environment Variables

### Backend Setup

1. Copy the example file:
```bash
cd backend
copy .env.example .env
```

2. Edit `backend/.env` and add:
   - Your MongoDB connection string
   - A random JWT secret (any long random string)
   - Your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Frontend Setup

1. Copy the example file:
```bash
cd frontend
copy .env.local.example .env.local
```

2. Edit `frontend/.env.local` and add:
   - Backend API URL (usually `http://localhost:5000`)
   - Your Gemini API key (same as backend)

## Step 3: Start MongoDB

**Option A: Local MongoDB**
- Make sure MongoDB is installed and running
- Default connection: `mongodb://localhost:27017/smart_education`

**Option B: MongoDB Atlas (Cloud)**
- Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Get connection string
- Use format: `mongodb+srv://username:password@cluster.mongodb.net/smart_education`

## Step 4: Seed Database (Optional but Recommended)

This creates sample data including admin and student accounts:

```bash
cd backend
npm run seed
```

**Default Accounts Created:**
- Admin: `admin@smarteducation.com` / `admin123`
- Student: `vikas@example.com` / `student123`

## Step 5: Run the Application

From the root directory:

```bash
npm run dev
```

This starts both frontend and backend simultaneously.

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Step 6: Test the Application

1. Open http://localhost:3000
2. Register a new account OR login with:
   - Email: `vikas@example.com`
   - Password: `student123` (if you ran seed script)
3. Explore the dashboard, subjects, and features!

## Troubleshooting

### Port Already in Use
- Change `PORT` in `backend/.env`
- Update `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

### MongoDB Connection Error
- Check MongoDB is running
- Verify connection string in `.env`
- For Atlas: Check IP whitelist and credentials

### Module Not Found
- Run `npm install` in the specific directory
- Delete `node_modules` and reinstall if needed

### Gemini API Errors
- Verify API key is correct
- Check API quota/limits
- Ensure key has proper permissions

## Next Steps After Setup

1. ✅ Test authentication (register/login)
2. ✅ Browse subjects and chapters
3. ✅ Try the AI chatbot
4. ✅ Take a quiz
5. ✅ Check progress tracking
6. ✅ View leaderboard
7. ✅ Test admin panel (login as admin)

## Need Help?

- See `SETUP.md` for detailed setup
- See `PROJECT_SUMMARY.md` for feature overview
- Check `backend/README.md` for API docs



