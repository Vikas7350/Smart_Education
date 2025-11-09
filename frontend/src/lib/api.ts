import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  register: (data: { name: string; email: string; password: string; class: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}

// Subjects
export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id: string) => api.get(`/subjects/${id}`),
  getChapters: (id: string) => api.get(`/subjects/${id}/chapters`),
  search: (query: string) => api.get(`/subjects/search/${query}`),
}

// Chapters
export const chaptersAPI = {
  getBySubject: (subjectId: string) => api.get(`/chapters/subject/${subjectId}`),
  getById: (id: string) => api.get(`/chapters/${id}`),
  complete: (id: string) => api.post(`/chapters/${id}/complete`),
  generateSummary: (id: string) => api.post(`/chapters/${id}/generate-summary`),
  generateQuiz: (id: string) => api.post(`/chapters/${id}/generate-quiz`),
}

// Quizzes
export const quizzesAPI = {
  getByChapter: (chapterId: string) => api.get(`/quizzes/chapter/${chapterId}`),
  submit: (id: string, data: { answers: Record<string, number>; timeTaken?: number }) =>
    api.post(`/quizzes/${id}/submit`, data),
  getDailyChallenge: () => api.get('/quizzes/daily-challenge'),
}

// Progress
export const progressAPI = {
  getAll: () => api.get('/progress'),
  getBySubject: (subjectId: string) => api.get(`/progress/subject/${subjectId}`),
}

// Leaderboard
export const leaderboardAPI = {
  get: (type?: string, limit?: number) =>
    api.get('/leaderboard', { params: { type, limit } }),
}

// AI
export const aiAPI = {
  getSummary: (chapterId: string) => api.post(`/ai/summary/${chapterId}`),
  chat: (data: { message: string; chapterId?: string; history?: any[] }) =>
    api.post('/ai/chat', data),
  generateQuiz: (chapterId: string, numberOfQuestions?: number) =>
    api.post(`/ai/generate-quiz/${chapterId}`, { numberOfQuestions }),
}

// Admin
export const adminAPI = {
  createSubject: (data: any) => api.post('/admin/subjects', data),
  updateSubject: (id: string, data: any) => api.put(`/admin/subjects/${id}`, data),
  deleteSubject: (id: string) => api.delete(`/admin/subjects/${id}`),
  createChapter: (data: any) => api.post('/admin/chapters', data),
  updateChapter: (id: string, data: any) => api.put(`/admin/chapters/${id}`, data),
  deleteChapter: (id: string) => api.delete(`/admin/chapters/${id}`),
  createQuiz: (data: any) => api.post('/admin/quizzes', data),
  updateQuiz: (id: string, data: any) => api.put(`/admin/quizzes/${id}`, data),
  deleteQuiz: (id: string) => api.delete(`/admin/quizzes/${id}`),
}

// Subscription
export const subscriptionAPI = {
  getStatus: () => api.get('/subscription/status'),
  getCurrent: () => api.get('/subscription/current'),
  createOrder: (planType: 'MONTHLY' | 'YEARLY') => api.post('/subscription/create-order', { planType }),
  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    api.post('/subscription/verify-payment', data),
}

export default api

