'use client'

import { useState, useEffect } from 'react'
import { quizzesAPI } from '@/lib/api'
import { CheckCircle, XCircle, Clock, Trophy, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Question {
  _id: string
  question: string
  options: string[]
  points: number
}

interface QuizResult {
  score: number
  totalQuestions: number
  correctAnswers: number
  totalPoints: number
  results: Array<{
    questionId: string
    question: string
    userAnswer: number
    correctAnswer: number
    isCorrect: boolean
    explanation: string
  }>
  bestScore: number
}

export default function QuizComponent({ quizId, chapterId }: { quizId: string; chapterId: string }) {
  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    loadQuiz()
  }, [quizId])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const loadQuiz = async () => {
    try {
      const response = await quizzesAPI.getByChapter(chapterId)
      setQuiz(response.data)
      setQuestions(response.data.questions || [])
      
      if (response.data.timeLimit > 0) {
        setTimeLeft(response.data.timeLimit)
      }
      
      setStartTime(Date.now())
    } catch (error) {
      toast.error('Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: string, answerIndex: number) => {
    if (result) return // Don't allow changes after submission
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }))
  }

  const handleSubmit = async () => {
    if (submitting || result) return

    setSubmitting(true)
    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0

    try {
      const response = await quizzesAPI.submit(quizId, {
        answers,
        timeTaken
      })
      setResult(response.data)
      toast.success('Quiz submitted!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            result.score >= 70 ? 'bg-green-100 dark:bg-green-900' :
            result.score >= 50 ? 'bg-yellow-100 dark:bg-yellow-900' :
            'bg-red-100 dark:bg-red-900'
          }`}>
            <Trophy className={`w-10 h-10 ${
              result.score >= 70 ? 'text-green-600' :
              result.score >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Quiz Completed!
          </h3>
          <p className="text-3xl font-bold text-primary-600 mb-2">
            {result.score}%
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            You got {result.correctAnswers} out of {result.totalQuestions} questions correct
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Points earned: {result.totalPoints}
          </p>
        </div>

        <div className="space-y-4">
          {result.results.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                item.isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {item.question}
                </p>
                {item.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 ml-2" />
                )}
              </div>
              {item.explanation && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <strong>Explanation:</strong> {item.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {quiz?.title || 'Quiz'}
        </h3>
        {timeLeft !== null && (
          <div className="flex items-center space-x-2 text-red-600">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((question, qIndex) => (
          <div key={question._id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {qIndex + 1}. {question.question}
            </p>
            <div className="space-y-2">
              {question.options.map((option, oIndex) => (
                <button
                  key={oIndex}
                  onClick={() => handleAnswer(question._id, oIndex)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    answers[question._id] === oIndex
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  <span className="text-gray-900 dark:text-white">{option}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length < questions.length}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50 flex items-center"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Quiz'
          )}
        </button>
      </div>
    </div>
  )
}



