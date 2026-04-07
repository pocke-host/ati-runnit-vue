import { ref } from 'vue'

export function useVoiceNote() {
  const isListening = ref(false)
  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  let recognition = null

  function startListening(onResult) {
    if (!isSupported || isListening.value) return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition = new SR()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => { isListening.value = true }

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || ''
      if (transcript) onResult(transcript)
    }

    recognition.onerror = () => {
      isListening.value = false
    }

    recognition.onend = () => { isListening.value = false }

    recognition.start()
  }

  function stopListening() {
    if (recognition) {
      recognition.abort()
      recognition = null
    }
    isListening.value = false
  }

  function toggleListening(onResult) {
    if (isListening.value) {
      stopListening()
    } else {
      startListening(onResult)
    }
  }

  return { isListening, isSupported, startListening, stopListening, toggleListening }
}
