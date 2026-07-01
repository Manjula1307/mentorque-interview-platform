import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

export default function Interview() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [status, setStatus] = useState('loading') 
  // loading → ready → ai-speaking → listening → processing → complete

  const [transcript, setTranscript] = useState([]) // full conversation for display
  const [currentAiText, setCurrentAiText] = useState('')
  const [error, setError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [candidateTranscript, setCandidateTranscript] = useState('')

  const recognitionRef = useRef(null)
  const synthRef = useRef(window.speechSynthesis)
  const transcriptEndRef = useRef(null)
  const statusRef = useRef(status)

  // Auto scroll to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript, candidateTranscript])

  // Speak text using browser TTS
  const speak = useCallback((text, onEnd) => {
    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Try to use a better voice if available
    const voices = synthRef.current.getVoices()
    const preferred = voices.find(v =>
      v.name.includes('Google') || v.name.includes('Natural') || v.lang === 'en-US'
    )
    if (preferred) utterance.voice = preferred

    utterance.onend = () => { if (onEnd) onEnd() }
    utterance.onerror = () => { if (onEnd) onEnd() }
    synthRef.current.speak(utterance)
  }, [])

  // Start listening to candidate
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported. Please use Chrome.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setStatus('listening')
      setCandidateTranscript('')
    }

    recognition.onresult = (event) => {
  let interimTranscript = ''
  let finalTranscript = ''

  for (let i = 0; i < event.results.length; i++) {
    const t = event.results[i][0].transcript
    if (event.results[i].isFinal) {
      finalTranscript += t
    } else {
      interimTranscript += t
    }
  }

  // Show final + interim combined so nothing disappears
  setCandidateTranscript(finalTranscript + interimTranscript)
}

    recognition.onerror = (event) => {
    if (event.error === 'network') {
      recognition.stop()
      setTimeout(() => {
        if (statusRef.current === 'listening') {
          startListening()
        }
      }, 300)
    } else if (event.error !== 'no-speech') {
      setError(`Microphone error: ${event.error}`)
    }
  }

  recognition.onend = () => {
    if (statusRef.current === 'listening') {
      setTimeout(() => startListening(), 300)
    }
  }

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  // Stop listening and send to backend
  const stopListeningAndProcess = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)

    const spokenText = candidateTranscript.trim()
    if (!spokenText) {
      setStatus('listening')
      startListening()
      return
    }

    // Add candidate message to display
    setTranscript(prev => [...prev, { speaker: 'candidate', content: spokenText }])
    setCandidateTranscript('')
    setStatus('processing')

    try {
      const res = await api.post(`/interview/${sessionId}/message`, {
        content: spokenText
      })

      const { response, isComplete } = res.data

      setTranscript(prev => [...prev, { speaker: 'ai', content: response }])
      setCurrentAiText(response)

      if (isComplete) {
        setStatus('complete')
        speak(response, () => {
          setTimeout(() => navigate(`/feedback/${sessionId}`), 1500)
        })
      } else {
        setStatus('ai-speaking')
        speak(response, () => {
          setStatus('listening')
          startListening()
        })
      }
    } catch (err) {
      setError('Failed to process your answer. Please try again.')
      setStatus('listening')
      startListening()
    }
  }, [candidateTranscript, sessionId, speak, startListening, navigate])

  // Load session and get AI opening
  useEffect(() => {
    async function initInterview() {
      try {
        const sessionRes = await api.get(`/interview/${sessionId}`)
        setSession(sessionRes.data.session)

        // If no messages yet, get AI opening
        if (sessionRes.data.messages.length === 0) {
          const startRes = await api.post(`/interview/${sessionId}/start`)
          const opening = startRes.data.response

          setTranscript([{ speaker: 'ai', content: opening }])
          setCurrentAiText(opening)
          setStatus('ai-speaking')

          speak(opening, () => {
            setStatus('listening')
            startListening()
          })
        } else {
          // Resume existing session
          setTranscript(sessionRes.data.messages)
          setStatus('listening')
          startListening()
        }
      } catch (err) {
        setError('Failed to load interview session.')
        setStatus('ready')
      }
    }

    initInterview()

    return () => {
      synthRef.current.cancel()
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [sessionId])

  const handleEndInterview = async () => {
    synthRef.current.cancel()
    if (recognitionRef.current) recognitionRef.current.stop()

    try {
      await api.post(`/interview/${sessionId}/end`)
      navigate(`/feedback/${sessionId}`)
    } catch {
      navigate(`/feedback/${sessionId}`)
    }
  }

  const statusConfig = {
    'loading':      { label: 'Loading your interview...', color: '#888',    pulse: false },
    'ready':        { label: 'Ready',                     color: '#888',    pulse: false },
    'ai-speaking':  { label: 'Alex is speaking...',       color: '#6c63ff', pulse: true  },
    'listening':    { label: 'Listening to you...',       color: '#22c55e', pulse: true  },
    'processing':   { label: 'Alex is thinking...',       color: '#f59e0b', pulse: true  },
    'complete':     { label: 'Interview complete!',       color: '#22c55e', pulse: false }
  }

  const currentStatus = statusConfig[status] || statusConfig['loading']

  useEffect(() => {
  statusRef.current = status
}, [status])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto', padding: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#6c63ff', fontWeight: '600', marginBottom: '4px' }}>
            🎙️ MENTORQUE — LIVE INTERVIEW
          </div>
          
          <div style={{ fontSize: '14px', color: '#888' }}>
            {session ? `${session.job_role} · ${session.experience_level}` : 'Loading...'}
          </div>
        </div>
        <button
          onClick={handleEndInterview}
          style={{
            width: 'auto', padding: '8px 20px', background: 'transparent',
            border: '1px solid #ff6b6b', color: '#ff6b6b', borderRadius: '8px',
            fontSize: '13px', fontWeight: '600'
          }}
        >
          End Interview
        </button>
      </div>

      {error && (
        <div style={{ background: '#2a1515', border: '1px solid #ff6b6b', borderRadius: '8px', padding: '12px 16px', color: '#ff6b6b', fontSize: '14px', marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Conversation transcript */}
      <div style={{
        flex: 1, overflowY: 'auto', marginBottom: '24px',
        display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        {transcript.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.speaker === 'candidate' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '75%',
              background: msg.speaker === 'candidate' ? '#1e1b4b' : '#1a1a1a',
              border: `1px solid ${msg.speaker === 'candidate' ? '#3730a3' : '#2a2a2a'}`,
              borderRadius: msg.speaker === 'candidate' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '14px 18px'
            }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px', fontWeight: '600' }}>
                {msg.speaker === 'candidate' ? '👤 YOU' : '🤖 ALEX (AI INTERVIEWER)'}
              </div>
              <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#e5e5e5' }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Live candidate transcript while speaking */}
        {candidateTranscript && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{
              maxWidth: '75%', background: '#0f172a',
              border: '1px dashed #3730a3', borderRadius: '16px 16px 4px 16px',
              padding: '14px 18px', opacity: 0.8
            }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px', fontWeight: '600' }}>
                👤 YOU (speaking...)
              </div>
              <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#94a3b8' }}>
                {candidateTranscript}
              </div>
            </div>
          </div>
        )}
        <div ref={transcriptEndRef} />
      </div>

      {/* Status bar + mic control */}
      <div style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a',
        borderRadius: '16px', padding: '24px', textAlign: 'center'
      }}>

        {/* Animated status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: currentStatus.color,
            boxShadow: currentStatus.pulse ? `0 0 12px ${currentStatus.color}` : 'none',
            animation: currentStatus.pulse ? 'pulse 1.5s infinite' : 'none'
          }} />
          <span style={{ color: currentStatus.color, fontWeight: '600', fontSize: '15px' }}>
            {currentStatus.label}
          </span>
        </div>

        {/* Mic button */}
        {status === 'listening' && (
          <div>
            <div
              onClick={stopListeningAndProcess}
              style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: '#22c55e', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 12px',
                cursor: 'pointer', fontSize: '28px',
                boxShadow: '0 0 24px rgba(34, 197, 94, 0.4)',
                transition: 'transform 0.1s'
              }}
            >
              🎤
            </div>
            <p style={{ color: '#666', fontSize: '13px' }}>
              Speak your answer, then click the mic to submit
            </p>
          </div>
        )}

        {status === 'ai-speaking' && (
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: '#1e1b4b', border: '2px solid #6c63ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: '28px'
          }}>
            🤖
          </div>
        )}

        {status === 'processing' && (
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: '#1a1500', border: '2px solid #f59e0b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: '28px'
          }}>
            ⏳
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}