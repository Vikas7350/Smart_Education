'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { progressAPI } from '@/lib/api'
import Navbar from '@/components/Navbar'
import { BarChart3, CheckCircle, Clock, TrendingUp, BookOpen } from 'lucide-react'

export default function ProgressPage() {
  const router = useRouter()
  const [progress, setProgress] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    loadProgress()
  }, [])

  const loadProgress = async () => {
    try {
      const response = await progressAPI.getAll()
      setProgress(response.data.progress)
      setStats(response.data.stats)
    } catch (error) {
      console.error('Failed to load progress')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-primary-600" />
            Your Progress
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your learning journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Chapters</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalChapters || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedChapters || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalQuizzes || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageScore || 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Progress List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Chapter Progress
          </h2>
          <div className="space-y-4">
            {progress.map((item) => (
              <div
                key={item._id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.chapter?.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.subject?.name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {item.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Best: {item.bestScore}%
                    </span>
                  </div>
                </div>
                {item.quizAttempts && item.quizAttempts.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Quizzes: {item.quizAttempts.length} attempt(s)
                  </div>
                )}
              </div>
            ))}
          </div>
          {progress.length === 0 && (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              No progress yet. Start learning to see your progress here!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

