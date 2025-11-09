'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { quizzesAPI } from '@/lib/api'
import Navbar from '@/components/Navbar'
import QuizComponent from '@/components/QuizComponent'
import { Trophy, Calendar, Award } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DailyChallengePage() {
  const router = useRouter()
  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    loadDailyChallenge()
  }, [])

  const loadDailyChallenge = async () => {
    try {
      const response = await quizzesAPI.getDailyChallenge()
      setQuiz(response.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('No daily challenge available today')
      } else {
        toast.error('Failed to load daily challenge')
      }
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

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Daily Challenge Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Check back tomorrow for a new challenge!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full mr-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Daily Challenge
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Test your knowledge with today's special quiz
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <Award className="w-5 h-5" />
              <span className="font-semibold">Bonus Points Available!</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Complete today's challenge to earn extra points and climb the leaderboard.
            </p>
          </div>
        </div>

        <QuizComponent quizId={quiz._id} chapterId={quiz.chapter?._id || ''} />
      </div>
    </div>
  )
}



