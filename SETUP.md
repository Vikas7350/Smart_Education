# Smart Education - Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local installation or MongoDB Atlas account)
3. **Google Gemini API Key** (Get from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install:all
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
- Install MongoDB locally
- Start MongoDB service
- Use connection string: `mongodb://localhost:27017/smart_education`

#### Option B: MongoDB Atlas (Cloud)
- Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Get connection string
- Use format: `mongodb+srv://username:password@cluster.mongodb.net/smart_education`

### 3. Backend Configuration

1. Navigate to `backend` folder:
```bash
cd backend
```

2. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_education
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Replace values:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A random secret string for JWT tokens
   - `GEMINI_API_KEY`: Your Google Gemini API key

### 4. Frontend Configuration

1. Navigate to `frontend` folder:
```bash
cd frontend
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Seed Database (Optional)

To populate the database with sample data:

```bash
cd backend
npm run seed
```

This will create:
- Admin user: `admin@smarteducation.com` / `admin123`
- Sample student: `vikas@example.com` / `student123`
- Sample subjects (Math, Science, etc.)
- Sample chapters and quizzes

### 6. Run the Application

#### Development Mode

From the root directory:
```bash
npm run dev
```

This will start both frontend (port 3000) and backend (port 5000).

Or run separately:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

#### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Default Login Credentials (After Seeding)

**Admin:**
- Email: `admin@smarteducation.com`
- Password: `admin123`

**Student:**
- Email: `vikas@example.com`
- Password: `student123`

## Features Overview

✅ **Authentication**: Register/Login with JWT
✅ **Dashboard**: Personalized greeting, stats, subject grid
✅ **Subjects & Chapters**: Browse and study content
✅ **AI Features**: 
   - Doubt solving chatbot (Gemini)
   - Chapter summary generation
   - Quiz generation
✅ **Quiz System**: MCQ quizzes with scoring and timer
✅ **Progress Tracking**: Track completed chapters and quiz scores
✅ **Leaderboard**: Rank by points or streak
✅ **Daily Challenges**: Special quizzes for bonus points
✅ **Dark/Light Theme**: Toggle theme preference
✅ **Text-to-Speech**: Listen to chapter content
✅ **PDF Download**: Download chapters as PDF
✅ **Bookmarks**: Save favorite chapters
✅ **Voice Search**: Search using voice input
✅ **Admin Panel**: Manage subjects, chapters, quizzes

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access for MongoDB Atlas

### Gemini API Error
- Verify API key is correct
- Check API quota/limits
- Ensure API key has proper permissions

### Port Already in Use
- Change `PORT` in backend `.env`
- Update `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Module Not Found
- Run `npm install` in both frontend and backend
- Delete `node_modules` and reinstall if needed

## Deployment

### Backend (Render/Railway/Heroku)
1. Set environment variables
2. Deploy Node.js app
3. Update frontend API URL

### Frontend (Vercel/Netlify)
1. Set `NEXT_PUBLIC_API_URL` to backend URL
2. Deploy Next.js app

## Support

For issues or questions, check the code comments or refer to the README files in each directory.



