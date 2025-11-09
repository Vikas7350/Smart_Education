import { useState, useEffect, useCallback } from 'react'

interface SpeechSynthesisOptions {
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
}

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true)
    }
  }, [])

  const speak = useCallback(
    ({ text, ...options }: { text: string } & SpeechSynthesisOptions) => {
      if (!supported) {
        console.warn('Speech synthesis is not supported in this browser')
        return
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options.rate || 1
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 1
      utterance.lang = options.lang || 'en-US'

      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)

      window.speechSynthesis.speak(utterance)
    },
    [supported]
  )

  const cancel = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }, [supported])

  return { speak, cancel, speaking, supported }
}



