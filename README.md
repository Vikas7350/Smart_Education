# Synapse Academy - Class 10 CBSE Learning Platform

A modern, full-stack web application for Class 10 CBSE students to learn and self-evaluate.

## Features

- 🔐 Authentication System (Register/Login with JWT)
- 📚 Subject & Chapter Navigation
- 🤖 AI-Powered Doubt Solving (Gemini API)
- 📝 Chapter Summaries (Gemini API)
- 🔊 Text-to-Speech
- ✅ Interactive Quiz System with Scoring
- 📊 Progress Tracker
- 🏆 Leaderboard
- 🎯 Daily Challenges
- 📄 PDF Notes Download
- 🔖 Bookmark Chapters
- 🌓 Dark/Light Theme
- 🎤 Voice Search
- 👨‍💼 Admin Panel

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **AI**: Google Gemini API

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas connection string)
- Google Gemini API key

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Configure environment variables:

**Backend** (`backend/.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/synapse_academy
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

3. Run the application:
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
synapse_academy/
├── frontend/          # Next.js frontend application
├── backend/           # Express backend API
└── README.md
```

## API Documentation

See `backend/README.md` for detailed API documentation.

## License

MIT



