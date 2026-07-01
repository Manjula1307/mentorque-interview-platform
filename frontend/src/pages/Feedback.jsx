import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

function ScoreRing({ score, label, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '72px', height: '72px', borderRadius: '50%',
        border: `4px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 8px',
        background: `${color}15`
      }}>
        <span style={{ fontSize: '20px', fontWeight: '700', color }}>{score}</span>
      </div>
      <div style={{ fontSize: '12px', color: '#888' }}>{label}</div>
    </div>
  )
}

export default function Feedback() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [feedback, setFeedback] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadFeedback() {
      try {
        // Get session info
        const sessionRes = await api.get(`/interview/${sessionId}`)
        setSession(sessionRes.data.session)

        // Generate/get feedback
        const feedbackRes = await api.post(`/interview/${sessionId}/feedback`)
        const parsed = feedbackRes.data.parsed ||
          JSON.parse(feedbackRes.data.feedback.full_report_text)
        setFeedback(parsed)
      } catch (err) {
        setError('Failed to load feedback report.')
      } finally {
        setLoading(false)
      }
    }

    loadFeedback()
  }, [sessionId])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
        <div style={{ color: '#888' }}>Generating your feedback report...</div>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#ff6b6b' }}>{error}</div>
    </div>
  )

  const scoreColor = feedback.overall_score >= 8 ? '#22c55e' :
    feedback.overall_score >= 6 ? '#f59e0b' : '#ff6b6b'

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px', paddingBottom: '60px', position: 'relative' }}>
     <button
        onClick={() => navigate('/dashboard')}
        style={{
        position: 'fixed',top: '16px',left: '16px',width: 'auto',padding: '6px 10px',borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.12)',color: '#f8fafc',
        fontSize: '12px',lineHeight: 1,boxShadow: '0 2px 10px rgba(0,0,0,0.25)',zIndex: 50,cursor: 'pointer'
        }}
    >
       Go to Dashboard
    </button>

      {/* Header */}
      
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
             <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', boxShadow: '0 0 20px var(--accent-glow)'
          }}>🎙</div>
          <span style={{ fontWeight: '800', fontSize: '15px', letterSpacing: '-0.3px' }}>
            Mentor<span style={{ color: 'var(--accent)' }}>que</span>
          </span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
          Your Feedback Report
        </h1>
        {session && (
          <p style={{ color: '#888', fontSize: '14px' }}>
            {session.job_role} · {session.experience_level} · Behavioral Interview
          </p>
        )}
      </div>

      {/* Overall Score */}
      <div style={{
        background: '#1a1a1a', border: `1px solid ${scoreColor}40`,
        borderRadius: '16px', padding: '28px', marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '12px', fontWeight: '600' }}>
          OVERALL SCORE
        </div>
        <div style={{
          fontSize: '64px', fontWeight: '800', color: scoreColor,
          lineHeight: 1, marginBottom: '12px'
        }}>
          {feedback.overall_score}<span style={{ fontSize: '28px', color: '#555' }}>/10</span>
        </div>
        <p style={{ color: '#ccc', fontSize: '15px', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }}>
          {feedback.summary}
        </p>
      </div>

      {/* Sub scores */}
      <div style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a',
        borderRadius: '16px', padding: '24px', marginBottom: '20px'
      }}>
        <div style={{ fontSize: '13px', color: '#888', fontWeight: '600', marginBottom: '20px' }}>
          DETAILED SCORES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <ScoreRing score={feedback.communication_score} label="Communication" color='var(--accent)'  />
          <ScoreRing score={feedback.content_score} label="Content Quality" color="#22c55e" />
          <ScoreRing score={feedback.confidence_score} label="Confidence" color="#f59e0b" />
        </div>
      </div>

      {/* STAR usage */}
      <div style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a',
        borderRadius: '16px', padding: '24px', marginBottom: '20px'
      }}>
        <div style={{ fontSize: '13px', color: '#888', fontWeight: '600', marginBottom: '12px' }}>
          ⭐ STAR METHOD USAGE
        </div>
        <p style={{ color: '#ccc', fontSize: '15px', lineHeight: '1.6' }}>
          {feedback.star_usage}
        </p>
      </div>

      {/* Strengths */}
      <div style={{
        background: '#0f1f0f', border: '1px solid #1a3a1a',
        borderRadius: '16px', padding: '24px', marginBottom: '20px'
      }}>
        <div style={{ fontSize: '13px', color: '#22c55e', fontWeight: '600', marginBottom: '16px' }}>
          ✅ STRENGTHS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {feedback.strengths?.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ color: '#22c55e', marginTop: '2px', flexShrink: 0 }}>→</span>
              <span style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Improvements */}
      <div style={{
        background: '#1f1500', border: '1px solid #3a2800',
        borderRadius: '16px', padding: '24px', marginBottom: '20px'
      }}>
        <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '600', marginBottom: '16px' }}>
          📈 AREAS TO IMPROVE
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {feedback.improvements?.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ color: '#f59e0b', marginTop: '2px', flexShrink: 0 }}>→</span>
              <span style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top tip */}
      <div style={{
        background: '#0f0f1f', border: '1px solid #3730a3',
        borderRadius: '16px', padding: '24px', marginBottom: '32px'
      }}>
        <div style={{ fontSize: '13px', color: '#6c63ff', fontWeight: '600', marginBottom: '12px' }}>
          💡 TOP TIP FOR YOUR NEXT INTERVIEW
        </div>
        <p style={{ color: '#a5b4fc', fontSize: '15px', lineHeight: '1.6', fontStyle: 'italic' }}>
          "{feedback.top_tip}"
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => navigate('/setup')}
          style={{ flex: 1 }}
        >
          🎙️ Practice Again
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            flex: 1, background: 'transparent',
            border: '1px solid #333', color: '#888'
          }}
        >
          View All Sessions
        </button>
      </div>

    </div>
  )
}