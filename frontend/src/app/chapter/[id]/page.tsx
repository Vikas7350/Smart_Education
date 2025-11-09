'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated, getStoredUser } from '@/lib/auth'
import { chaptersAPI, aiAPI, quizzesAPI, subscriptionAPI } from '@/lib/api'
import Navbar from '@/components/Navbar'
import QuizComponent from '@/components/QuizComponent'
import AIChatbot from '@/components/AIChatbot'
import { ArrowLeft, Volume2, FileText, Bookmark, Download, Loader2, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import jsPDF from 'jspdf'

export default function ChapterPage() {
  const router = useRouter()
  const params = useParams()
  const [chapter, setChapter] = useState<any>(null)
  const [summary, setSummary] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const { speak, cancel, speaking } = useSpeechSynthesis()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    setUser(getStoredUser())
    loadSubscriptionStatus()
    loadChapter()
  }, [params.id])

  const loadSubscriptionStatus = async () => {
    try {
      const response = await subscriptionAPI.getCurrent()
      setSubscriptionStatus(response.data)
    } catch (error) {
      // If subscription check fails, assume no subscription
      setSubscriptionStatus({ hasSubscription: false, isActive: false })
    }
  }

  const loadChapter = async () => {
    try {
      const response = await chaptersAPI.getById(params.id as string)
      const chapterData = response.data.chapter
      setChapter(chapterData)
      setSummary(chapterData.summary || '')
      
      // Check if quiz exists, if not show generate button
      if (!chapterData.quiz && chapterData.chapterContent) {
        // Quiz will be generated on demand
      }
      
      // Check if bookmarked
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
      setIsBookmarked(bookmarks.includes(params.id))
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.subscriptionRequired) {
        toast.error('Subscription required to access this content')
        router.push('/subscription')
      } else {
        toast.error('Failed to load chapter')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSummary = async () => {
    setSummaryLoading(true)
    try {
      const response = await chaptersAPI.generateSummary(params.id as string)
      setSummary(response.data.summary)
      toast.success('Summary generated!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate summary')
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleGenerateQuiz = async () => {
    try {
      await chaptersAPI.generateQuiz(params.id as string)
      toast.success('Quiz generated! Refreshing...')
      // Reload chapter to get updated quiz
      setTimeout(() => {
        loadChapter()
        setShowQuiz(true)
      }, 1000)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate quiz')
    }
  }

  const handleTextToSpeech = () => {
    if (speaking) {
      cancel()
    } else {
      // Strip HTML tags for TTS
      const content = chapter?.contentHTML || chapter?.chapterContent || chapter?.content || ''
      const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 5000)
      if (text) {
        speak({ text, rate: 0.9, pitch: 1 })
      } else {
        toast.error('No content available for text-to-speech')
      }
    }
  }

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
    if (isBookmarked) {
      const updated = bookmarks.filter((id: string) => id !== params.id)
      localStorage.setItem('bookmarks', JSON.stringify(updated))
      setIsBookmarked(false)
      toast.success('Removed from bookmarks')
    } else {
      bookmarks.push(params.id)
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
      setIsBookmarked(true)
      toast.success('Added to bookmarks')
    }
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(chapter?.chapterTitle || chapter?.title || 'Chapter', 10, 10)
    doc.setFontSize(12)
    // Strip HTML tags for PDF
    const content = chapter?.contentHTML || chapter?.chapterContent || chapter?.content || ''
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    if (textContent) {
      const lines = doc.splitTextToSize(textContent, 180)
      doc.text(lines, 10, 20)
      doc.save(`${chapter?.chapterTitle || chapter?.title || 'chapter'}.pdf`)
      toast.success('PDF downloaded!')
    } else {
      toast.error('No content available to download')
    }
  }

  const handleCompleteChapter = async () => {
    try {
      await chaptersAPI.complete(params.id as string)
      toast.success('Chapter marked as completed!')
    } catch (error) {
      toast.error('Failed to mark chapter as complete')
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
          href={`/subject/${chapter?.subject?._id || chapter?.subject}`}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subject
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {chapter?.chapterTitle || chapter?.title}
            </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {chapter?.subject?.name || 'Subject'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg ${isBookmarked ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'} hover:bg-gray-200 dark:hover:bg-gray-600 transition`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleTextToSpeech}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <Volume2 className={`w-5 h-5 ${speaking ? 'text-primary-600' : ''}`} />
              </button>
              <button
                onClick={handleDownloadPDF}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setShowChatbot(!showChatbot)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
            >
              {showChatbot ? 'Hide' : 'Ask'} Doubt
            </button>
            <button
              onClick={handleGenerateSummary}
              disabled={summaryLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 flex items-center"
            >
              {summaryLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Summary
                </>
              )}
            </button>
            {chapter?.quiz ? (
              <button
                onClick={() => setShowQuiz(!showQuiz)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                {showQuiz ? 'Hide' : 'Take'} Quiz (10 Questions)
              </button>
            ) : (
              <button
                onClick={handleGenerateQuiz}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 mr-2" />
                    Generate Quiz (10 MCQs)
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleCompleteChapter}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Mark as Complete
            </button>
          </div>

          {/* Summary */}
          {summary && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Summary</h3>
              <p className="text-blue-800 dark:text-blue-300">{summary}</p>
            </div>
          )}

          {/* Subscription Lock Warning */}
          {!subscriptionStatus?.isActive && user?.role !== 'admin' && (
            <div className="mb-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Lock className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                      Subscription Required
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      {subscriptionStatus?.hasSubscription
                        ? 'Your subscription has expired. Renew now to continue learning.'
                        : 'Subscribe to unlock full access to this chapter and all content.'}
                    </p>
                  </div>
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

          {/* Chapter Content */}
          <div className={`chapter-content-wrapper relative ${!subscriptionStatus?.isActive && user?.role !== 'admin' ? 'blur-sm pointer-events-none' : ''}`}>
            <div
              className="chapter-content"
              dangerouslySetInnerHTML={{ 
                __html: chapter?.contentHTML || chapter?.chapterContent || chapter?.content || '<p class="text-center text-gray-500">Content is being generated... Please wait.</p>' 
              }}
            />
            {!subscriptionStatus?.isActive && user?.role !== 'admin' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
                <div className="text-center">
                  <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 font-semibold">
                    Subscribe to unlock this content
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <style jsx global>{`
            .chapter-content-wrapper {
              max-width: 100%;
              padding: 2rem 0;
            }
            
            .chapter-content {
              font-family: 'Georgia', 'Times New Roman', serif;
              font-size: 1.1rem;
              line-height: 1.8;
              color: #2d3748;
              max-width: 900px;
              margin: 0 auto;
              padding: 0 1rem;
            }
            
            .dark .chapter-content {
              color: #e2e8f0;
            }
            
            .chapter-content h1 {
              font-size: 2rem;
              font-weight: 700;
              margin-top: 2.5rem;
              margin-bottom: 1.5rem;
              color: #1a202c;
              border-bottom: 3px solid #4299e1;
              padding-bottom: 0.5rem;
            }
            
            .dark .chapter-content h1 {
              color: #f7fafc;
              border-bottom-color: #63b3ed;
            }
            
            .chapter-content h2 {
              font-size: 1.75rem;
              font-weight: 700;
              margin-top: 2.5rem;
              margin-bottom: 1.25rem;
              color: #2d3748;
              padding-left: 0.5rem;
              border-left: 4px solid #4299e1;
            }
            
            .dark .chapter-content h2 {
              color: #e2e8f0;
              border-left-color: #63b3ed;
            }
            
            .chapter-content h3 {
              font-size: 1.4rem;
              font-weight: 600;
              margin-top: 2rem;
              margin-bottom: 1rem;
              color: #4a5568;
            }
            
            .dark .chapter-content h3 {
              color: #cbd5e0;
            }
            
            .chapter-content p {
              margin: 1.25rem 0;
              line-height: 1.9;
              text-align: justify;
              font-size: 1.1rem;
            }
            
            .chapter-content ul, .chapter-content ol {
              margin: 1.5rem 0;
              padding-left: 2.5rem;
            }
            
            .chapter-content li {
              margin: 0.75rem 0;
              line-height: 1.8;
            }
            
            .chapter-content img {
              max-width: 100%;
              height: auto;
              margin: 2rem auto;
              display: block;
              border-radius: 0.75rem;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border: 1px solid #e2e8f0;
            }
            
            .dark .chapter-content img {
              border-color: #4a5568;
            }
            
            .chapter-content strong {
              font-weight: 700;
              color: #2d3748;
            }
            
            .dark .chapter-content strong {
              color: #f7fafc;
            }
            
            .chapter-content em {
              font-style: italic;
              color: #4a5568;
            }
            
            .dark .chapter-content em {
              color: #a0aec0;
            }
            
            .chapter-content blockquote {
              border-left: 4px solid #4299e1;
              padding-left: 1.5rem;
              margin: 1.5rem 0;
              font-style: italic;
              background-color: #f7fafc;
              padding: 1rem 1.5rem;
              border-radius: 0.5rem;
            }
            
            .dark .chapter-content blockquote {
              background-color: #2d3748;
              border-left-color: #63b3ed;
            }
            
            .chapter-content table {
              width: 100%;
              border-collapse: collapse;
              margin: 2rem 0;
            }
            
            .chapter-content table th,
            .chapter-content table td {
              border: 1px solid #e2e8f0;
              padding: 0.75rem;
              text-align: left;
            }
            
            .dark .chapter-content table th,
            .dark .chapter-content table td {
              border-color: #4a5568;
            }
            
            .chapter-content table th {
              background-color: #edf2f7;
              font-weight: 600;
            }
            
            .dark .chapter-content table th {
              background-color: #2d3748;
            }
          `}</style>
        </div>

        {/* AI Chatbot */}
        {showChatbot && (
          <div className="mb-6">
            <AIChatbot chapterId={params.id as string} />
          </div>
        )}

        {/* Quiz */}
        {showQuiz && chapter?.quiz && (
          <div className="mb-6">
            <QuizComponent quizId={chapter.quiz._id || chapter.quiz} chapterId={params.id as string} />
          </div>
        )}
      </div>
    </div>
  )
}

