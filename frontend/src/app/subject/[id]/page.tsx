'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '@/lib/auth'
import { subjectsAPI, chaptersAPI } from '@/lib/api'
import Navbar from '@/components/Navbar'
import { ArrowLeft, BookOpen, Clock, CheckCircle, Circle, PlayCircle } from 'lucide-react'

interface Chapter {
  _id: string
  chapterTitle: string
  title: string
  chapterNumber: number
  difficulty: string
  estimatedTime: number
  previewText?: string
  progressState?: 'Not Started' | 'In Progress' | 'Completed'
}

export default function SubjectPage() {
  const router = useRouter()
  const params = useParams()
  const [subject, setSubject] = useState<any>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    loadSubject()
  }, [params.id])

  const loadSubject = async () => {
    try {
      // Use the new endpoint for chapters
      const [subjectRes, chaptersRes] = await Promise.all([
        subjectsAPI.getById(params.id as string),
        subjectsAPI.getChapters(params.id as string).catch(() => chaptersAPI.getBySubject(params.id as string))
      ])
      setSubject(subjectRes.data)
      setChapters(chaptersRes.data || [])
    } catch (error) {
      console.error('Failed to load subject', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressIcon = (state?: string) => {
    switch (state) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'In Progress':
        return <PlayCircle className="w-5 h-5 text-blue-500" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const getProgressColor = (state?: string) => {
    switch (state) {
      case 'Completed':
        return 'text-green-600 dark:text-green-400'
      case 'In Progress':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
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
        <Link
          href="/dashboard"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-center mb-4">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl mr-4"
              style={{ backgroundColor: `${subject?.color || '#6366f1'}20` }}
            >
              {subject?.icon || '📚'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {subject?.name}
              </h1>
              {subject?.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {subject.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Chapters ({chapters.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => (
              <Link
                key={chapter._id}
                href={`/chapter/${chapter._id}`}
                className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-primary-600" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Chapter {chapter.chapterNumber}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getProgressIcon(chapter.progressState)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(chapter.difficulty)}`}>
                      {chapter.difficulty}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition">
                  {chapter.chapterTitle || chapter.title}
                </h3>
                {chapter.previewText && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {chapter.previewText}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {chapter.estimatedTime || 30} min
                  </div>
                  <span className={`text-xs font-medium ${getProgressColor(chapter.progressState)}`}>
                    {chapter.progressState || 'Not Started'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {chapters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No chapters available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

