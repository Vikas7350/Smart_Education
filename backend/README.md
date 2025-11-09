# Synapse Academy Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/synapse_academy
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
```

3. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Subjects
- `GET /api/subjects` - Get all subjects (protected)
- `GET /api/subjects/:id` - Get single subject (protected)
- `GET /api/subjects/search/:query` - Search subjects (protected)

### Chapters
- `GET /api/chapters/subject/:subjectId` - Get chapters by subject (protected)
- `GET /api/chapters/:id` - Get single chapter (protected)
- `POST /api/chapters/:id/complete` - Mark chapter as complete (protected)

### Quizzes
- `GET /api/quizzes/chapter/:chapterId` - Get quiz for chapter (protected)
- `POST /api/quizzes/:id/submit` - Submit quiz (protected)
- `GET /api/quizzes/daily-challenge` - Get daily challenge (protected)

### Progress
- `GET /api/progress` - Get user progress (protected)
- `GET /api/progress/subject/:subjectId` - Get progress by subject (protected)

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard (protected)
  - Query params: `type` (points/streak), `limit` (default: 50)

### AI
- `POST /api/ai/summary/:chapterId` - Generate chapter summary (protected)
- `POST /api/ai/chat` - Chat with AI tutor (protected)
- `POST /api/ai/generate-quiz/:chapterId` - Generate quiz using AI (protected)

### Admin (Admin only)
- `POST /api/admin/subjects` - Create subject
- `PUT /api/admin/subjects/:id` - Update subject
- `DELETE /api/admin/subjects/:id` - Delete subject
- `POST /api/admin/chapters` - Create chapter
- `PUT /api/admin/chapters/:id` - Update chapter
- `DELETE /api/admin/chapters/:id` - Delete chapter
- `POST /api/admin/quizzes` - Create quiz
- `PUT /api/admin/quizzes/:id` - Update quiz
- `DELETE /api/admin/quizzes/:id` - Delete quiz

## Database Models

### User
- name, email, password, class, role, points, streak, badges, bookmarks

### Subject
- name, description, icon, color, class, chapters

### Chapter
- title, subject, chapterNumber, content, summary, images, tables, keywords, difficulty, estimatedTime, quiz

### Quiz
- title, chapter, subject, questions, timeLimit, totalPoints, difficulty, isDailyChallenge

### Progress
- user, chapter, subject, completed, completedAt, quizAttempts, bestScore, lastAccessed



