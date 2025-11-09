export interface User {
  id: string
  name: string
  email: string
  class: string
  role: string
  points: number
  streak: number
  badges?: string[]
}

export interface Subject {
  _id: string
  name: string
  description?: string
  icon: string
  color: string
  class: string
  chapters?: Chapter[]
}

export interface Chapter {
  _id: string
  title: string
  subject: string | Subject
  chapterNumber: number
  content: string
  summary?: string
  images?: Array<{ url: string; caption: string }>
  tables?: Array<{ title: string; data: any }>
  keywords?: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime?: number
  quiz?: string | Quiz
}

export interface Quiz {
  _id: string
  title: string
  chapter?: string | Chapter
  subject?: string | Subject
  questions: Question[]
  timeLimit?: number
  totalPoints?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  isDailyChallenge?: boolean
}

export interface Question {
  _id?: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  points?: number
}

export interface Progress {
  _id: string
  user: string | User
  chapter: string | Chapter
  subject: string | Subject
  completed: boolean
  completedAt?: Date
  quizAttempts: QuizAttempt[]
  bestScore: number
  lastAccessed: Date
}

export interface QuizAttempt {
  quiz: string | Quiz
  score: number
  totalQuestions: number
  correctAnswers: number
  timeTaken: number
  attemptedAt: Date
}

export interface LeaderboardEntry {
  rank: number
  name: string
  points: number
  streak: number
  badges: string[]
  isCurrentUser: boolean
}



