'use client'

import { useState, useRef, useEffect } from 'react'
import { aiAPI } from '@/lib/api'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIChatbot({ chapterId }: { chapterId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI tutor. How can I help you with this chapter?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await aiAPI.chat({
        message: userMessage,
        chapterId,
        history: messages
      })

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to get AI response')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center mb-4">
        <Bot className="w-6 h-6 text-primary-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Tutor</h3>
      </div>

      <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`p-2 rounded-full ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <Bot className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your doubt..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50 flex items-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}



