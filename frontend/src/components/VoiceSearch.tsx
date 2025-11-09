'use client'

import { useState, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'

interface VoiceSearchProps {
  onTranscript: (text: string) => void
}

export default function VoiceSearch({ onTranscript }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  }, [])

  const startListening = () => {
    if (!isSupported) {
      alert('Voice search is not supported in your browser')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const stopListening = () => {
    setIsListening(false)
    // The recognition will stop automatically
  }

  if (!isSupported) {
    return null
  }

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      className={`p-2 rounded-lg transition ${
        isListening
          ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
      title={isListening ? 'Stop listening' : 'Start voice search'}
    >
      {isListening ? (
        <MicOff className="w-5 h-5 animate-pulse" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  )
}



