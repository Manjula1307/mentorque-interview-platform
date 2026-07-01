import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const JOB_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist',
  'Product Manager',
  'UI/UX Designer',
  'DevOps Engineer',
  'Machine Learning Engineer',
  'Business Analyst',
  'Other'
]

const EXPERIENCE_LEVELS = [
  'Fresher (0-1 years)',
  'Junior (1-2 years)',
  'Mid-level (2-4 years)',
  'Senior (4+ years)'
]

export default function Setup() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [form, setForm] = useState({
    job_role: '',
    experience_level: '',
    job_description: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/sessions/start', form)
      const sessionId = res.data.session.id
      navigate(`/interview/${sessionId}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>

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
            <button
              onClick={() => navigate(-1)}
              style={{
                position: 'fixed',top: '16px',left: '16px',width: 'auto',padding: '6px 10px',borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.12)',color: '#f8fafc',
                fontSize: '12px',lineHeight: 1,boxShadow: '0 2px 10px rgba(0,0,0,0.25)',zIndex: 50,cursor: 'pointer'
              }}
            >
              ← Back
            </button>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
            Hey {user.name?.split(' ')[0] || 'there'}, let's set up your interview
          </h1>
          <p style={{ color: '#888', fontSize: '15px' }}>
            Tell us about the role you're preparing for. The AI will tailor the interview specifically to your background.
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a',
          borderRadius: '16px', padding: '32px'
        }}>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* Job Role */}
            <label>What role are you interviewing for?</label>
            <select
              name="job_role"
              value={form.job_role}
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '12px 16px', background: '#111',
                border: '1px solid #333', borderRadius: '8px', color: '#fff',
                fontSize: '15px', marginBottom: '20px', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="">Select a role...</option>
              {JOB_ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            {/* Experience Level */}
            <label>Your experience level</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {EXPERIENCE_LEVELS.map(level => (
                <div
                  key={level}
                  onClick={() => setForm({ ...form, experience_level: level })}
                  style={{
                    padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                    border: form.experience_level === level ? '2px solid #6c63ff' : '1px solid #333',
                    background: form.experience_level === level ? '#1e1b4b' : '#111',
                    color: form.experience_level === level ? '#a5b4fc' : '#aaa',
                    fontSize: '13px', fontWeight: '500', transition: 'all 0.15s'
                  }}
                >
                  {level}
                </div>
              ))}
            </div>

            {/* Job Description */}
            <label>
              Paste job description or your resume highlights{' '}
              <span style={{ color: '#555', fontWeight: '400' }}>(optional but recommended)</span>
            </label>
            <textarea
              name="job_description"
              value={form.job_description}
              onChange={handleChange}
              placeholder="Paste the job description here, or paste key points from your resume. The AI will use this to ask relevant, personalized questions..."
              rows={5}
              style={{
                width: '100%', padding: '12px 16px', background: '#111',
                border: '1px solid #333', borderRadius: '8px', color: '#fff',
                fontSize: '14px', marginBottom: '24px', outline: 'none',
                resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5'
              }}
            />

            {/* Interview Type Badge */}
            <div style={{
              background: '#0f0f0f', border: '1px solid #2a2a2a',
              borderRadius: '10px', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: '12px',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '20px' }}>🧠</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                  Behavioral Interview
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Communication · STAR structure · Self-awareness · Situational judgment
                </div>
              </div>
              <div style={{
                marginLeft: 'auto', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff',
                fontSize: '11px', fontWeight: '600', padding: '4px 10px',
                borderRadius: '20px'
              }}>
                SELECTED
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.job_role || !form.experience_level}
              style={{color: '#fff', background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              border: 'none', padding: '14px 20px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', width: '100%', 
              cursor: loading || !form.job_role || !form.experience_level ? 'not-allowed' : 'pointer', opacity: loading || !form.job_role || !form.experience_level ? 0.6 : 1, 
              transition: 'all 0.15s'}}
            >
              {loading ? 'Starting your interview...' : '🎙️ Start Voice Interview'}
            </button>

          </form>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', color: '#555', fontSize: '13px', marginTop: '16px' }}>
          Make sure your microphone is connected before starting
        </p>

      </div>
    </div>
  )
}