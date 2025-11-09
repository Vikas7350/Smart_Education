'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated, getStoredUser } from '@/lib/auth'
import { subjectsAPI, progressAPI, subscriptionAPI } from '@/lib/api'
import Navbar from '@/components/Navbar'
import { BookOpen, TrendingUp, Clock, Award, Sparkles, Trophy, Crown, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Subject {
  _id: string
  name: string
  description: string
  icon: string
  color: string
  chapters: any[]
  chapterCount?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recommendedTopics, setRecommendedTopics] = useState<string[]>([])
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    setUser(getStoredUser())
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const [subjectsRes, progressRes, subscriptionRes] = await Promise.all([
        subjectsAPI.getAll(),
        progressAPI.getAll(),
        subscriptionAPI.getCurrent().catch(() => ({ data: { hasSubscription: false, isActive: false } }))
      ])

      setSubjects(subjectsRes.data)
      setSubscriptionStatus(subscriptionRes.data)
      
      // Get recommended topics from recent searches (stored in localStorage)
      const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]')
      setRecommendedTopics(recentSearches.slice(0, 5))

      // Handle search query
      const searchQuery = searchParams.get('search')
      if (searchQuery) {
        const searchResults = await subjectsAPI.search(searchQuery)
        setSubjects(searchResults.data)
        // Save to recent searches
        const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]')
        if (!searches.includes(searchQuery)) {
          searches.unshift(searchQuery)
          localStorage.setItem('recentSearches', JSON.stringify(searches.slice(0, 10)))
        }
      }
    } catch (error: any) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
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
        {/* Personalized Greeting */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {getGreeting()}, {user?.name}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Ready to learn something new today?
              </p>
            </div>
            {user?.role !== 'admin' && (
              <Link
                href="/subscription"
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  subscriptionStatus?.isActive
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                }`}
              >
                {subscriptionStatus?.isActive ? (
                  <div className="flex items-center">
                    <Crown className="w-4 h-4 mr-2" />
                    <span>Active</span>
                    {subscriptionStatus?.daysRemaining > 0 && (
                      <span className="ml-2 text-xs">
                        ({subscriptionStatus.daysRemaining} days left)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    <span>Subscribe</span>
                  </div>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Subscription Warning */}
        {!subscriptionStatus?.isActive && user?.role !== 'admin' && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <p className="text-yellow-800 dark:text-yellow-200">
                  {subscriptionStatus?.hasSubscription
                    ? 'Your subscription has expired. Renew now to continue learning.'
                    : 'Subscribe to unlock full access to all subjects, chapters, and quizzes.'}
                </p>
              </div>
              <Link
                href="/subscription"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                {subscriptionStatus?.hasSubscription ? 'Renew Now' : 'Subscribe Now'}
              </Link>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Points</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{user?.points || 0}</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{user?.streak || 0} days</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subjects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{subjects.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <Link
            href="/daily-challenge"
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Daily Challenge</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">Ready</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-500" />
            </div>
          </Link>
        </div>

        {/* Recommended Topics */}
        {recommendedTopics.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary-600" />
              Recommended Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {recommendedTopics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => router.push(`/dashboard?search=${encodeURIComponent(topic)}`)}
                  className="px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm hover:bg-primary-200 dark:hover:bg-primary-800 transition"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subjects Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Class 10 CBSE Subjects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Link
                key={subject._id}
                href={`/subject/${subject._id}`}
                className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${subject.color}20` }}
                  >
                    {subject.icon || '📚'}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {subject.chapterCount || subject.chapters?.length || 0} chapters
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition">
                  {subject.name}
                </h3>
                {subject.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {subject.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No subjects found. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  )
}
